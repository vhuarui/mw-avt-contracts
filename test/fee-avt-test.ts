import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { randomHex } from './utils/encoding'
import { faucet } from './utils/impersonate'
import { takeSnapshot, SnapshotRestorer, time, mine } from '@nomicfoundation/hardhat-network-helpers'
import { ALP, AVT, RewardDistributor, FeeAvtRewardTracker, WETH9 } from '../typechain'
import { Wallet } from 'ethers'
import { Address } from 'hardhat-deploy/types'
import { deployContract } from './utils/contracts'
import { expect } from 'chai'
import { expandDecimals } from '../utils/helper'
import { delay } from '../tasks/utils'

describe('Initial', async function () {
  let owner: any
  let daoFund: Wallet
  let user0: Wallet
  let user1: Wallet
  let user2: Wallet
  let user3: Wallet
  let user4: Wallet
  const { provider } = ethers
  // after(async () => {
  //   console.log('reset')
  //   await network.provider.request({
  //     method: 'hardhat_reset',
  //   })
  // })
  before('', async function () {
    owner = await ethers.getNamedSigner('deployer')
    console.log('owner', owner.address)
    daoFund = new ethers.Wallet(randomHex(32), provider)
    user0 = new ethers.Wallet(randomHex(32), provider)
    user1 = new ethers.Wallet(randomHex(32), provider)
    user2 = new ethers.Wallet(randomHex(32), provider)
    user3 = new ethers.Wallet(randomHex(32), provider)
    user4 = new ethers.Wallet(randomHex(32), provider)

    await Promise.all([owner, daoFund, user0, user1, user2, user3, user4].map((owner) => faucet(owner.address, provider)))
  })

  describe('FeeAvt', function () {
    let tokens: { [x: string]: { address: any } }
    let tokenSnapshot: SnapshotRestorer

    let avt: AVT
    let weth: WETH9
    let alp: ALP
    // let rewardRouterV2: RewardRouterV2
    let feeAvtTracker: FeeAvtRewardTracker
    let feeAvtRewardDistributor: RewardDistributor
    // let stakedAlpTracker: RewardTracker
    // let stakedAlpTracker2: RewardTracker
    // let alpManager: AlpManager

    const getBalance = async (name: String, token: any, account: Address) => {
      const balance = await token.balanceOf(account)
      console.log(`${name} - ${account}`, 'Balance', formatUnits(balance, await token.decimals()))
      return balance
    }

    const getTotalSupply = async (name: String, token: any) => {
      const supply = await token.totalSupply()
      console.log(name, 'TotalSupply', formatUnits(supply, await token.decimals()))
      return supply
    }

    const increaseTime = async (seconds: any) => {
      return time.increase(seconds)
    }
    const mineBlock = async (blocks: any) => {
      return mine(blocks)
    }

    before('', async function () {
      // avt = (await ethers.getContract('AVT')) as AVT
      // weth = (await ethers.getContractAt('WETH9', '0x47E48884E07084D162b912038aEc64e982549166')) as WETH9
      // feeAvtTracker = (await ethers.getContract('FeeAvtTracker')) as FeeAvtRewardTracker
      // feeAvtRewardDistributor = (await ethers.getContract('FeeAvtDistributor')) as RewardDistributor
      // await feeAvtTracker.setInPrivateStakingMode(false)

      avt = (await deployContract('AVT', owner)) as AVT
      weth = (await deployContract('WETH9', owner, parseUnits('10000000000'))) as WETH9
      feeAvtTracker = (await deployContract(
        'FeeAvtRewardTracker',
        owner,
        'RT_NAME',
        'RT_SYMBOL',
      )) as FeeAvtRewardTracker
      feeAvtRewardDistributor = (await deployContract(
        'RewardDistributor',
        owner,
        weth.address,
        feeAvtTracker.address,
      )) as RewardDistributor

      await feeAvtTracker.initialize([avt.address], feeAvtRewardDistributor.address, daoFund.address)
      await feeAvtRewardDistributor.updateLastDistributionTime()

      await avt.setMinter(owner.address, true)
      // await avt.mint(distributor1.address, parseUnits('10000000').mul(10000))
      // await avt.mint(distributor2.address, parseUnits('10000000').mul(10000))

      tokenSnapshot = await takeSnapshot()

      tokens = require('../config/tokens.json')[network.name]
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })
    after(async () => {
      await tokenSnapshot.restore()
    })

    it('inits', async () => {
      expect(await feeAvtTracker.isInitialized()).eq(true)
      expect(await feeAvtTracker.isDepositToken(owner.address)).eq(false)
      expect(await feeAvtTracker.isDepositToken(avt.address)).eq(true)
      expect(await feeAvtTracker.distributor()).eq(feeAvtRewardDistributor.address)
      expect(await feeAvtTracker.rewardToken()).eq(weth.address)

      await expect(
        feeAvtTracker.initialize([avt.address], feeAvtRewardDistributor.address, daoFund.address),
      ).to.be.revertedWith('RewardTracker: already initialized')
    })

    it('setDepositToken', async () => {
      await expect(feeAvtTracker.connect(user0).setDepositToken(user1.address, true)).to.be.revertedWith(
        'Governable: forbidden',
      )

      await feeAvtTracker.setGov(user0.address)

      expect(await feeAvtTracker.isDepositToken(user1.address)).eq(false)
      await feeAvtTracker.connect(user0).setDepositToken(user1.address, true)
      expect(await feeAvtTracker.isDepositToken(user1.address)).eq(true)
      await feeAvtTracker.connect(user0).setDepositToken(user1.address, false)
      expect(await feeAvtTracker.isDepositToken(user1.address)).eq(false)
    })

    it('setInPrivateTransferMode', async () => {
      await expect(feeAvtTracker.connect(user0).setInPrivateTransferMode(true)).to.be.revertedWith(
        'Governable: forbidden',
      )

      await feeAvtTracker.setGov(user0.address)

      expect(await feeAvtTracker.inPrivateTransferMode()).eq(false)
      await feeAvtTracker.connect(user0).setInPrivateTransferMode(true)
      expect(await feeAvtTracker.inPrivateTransferMode()).eq(true)
    })

    it('setInPrivateStakingMode', async () => {
      await expect(feeAvtTracker.connect(user0).setInPrivateStakingMode(true)).to.be.revertedWith(
        'Governable: forbidden',
      )

      await feeAvtTracker.setGov(user0.address)

      expect(await feeAvtTracker.inPrivateStakingMode()).eq(false)
      await feeAvtTracker.connect(user0).setInPrivateStakingMode(true)
      expect(await feeAvtTracker.inPrivateStakingMode()).eq(true)
    })

    it('setHandler', async () => {
      await expect(feeAvtTracker.connect(user0).setHandler(user1.address, true)).to.be.revertedWith(
        'Governable: forbidden',
      )

      await feeAvtTracker.setGov(user0.address)

      expect(await feeAvtTracker.isHandler(user1.address)).eq(false)
      await feeAvtTracker.connect(user0).setHandler(user1.address, true)
      expect(await feeAvtTracker.isHandler(user1.address)).eq(true)
    })

    it('withdrawToken', async () => {
      await avt.setMinter(owner.address, true)
      await avt.mint(feeAvtTracker.address, 2000)
      await expect(feeAvtTracker.connect(user0).withdrawToken(avt.address, user1.address, 2000)).to.be.revertedWith(
        'Governable: forbidden',
      )

      await feeAvtTracker.setGov(user0.address)

      expect(await avt.balanceOf(user1.address)).eq(0)
      await feeAvtTracker.connect(user0).withdrawToken(avt.address, user1.address, 2000)
      expect(await avt.balanceOf(user1.address)).eq(2000)
    })

    it('dao stake0, user stake, unstake, claim', async () => {
      await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
      await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
      await avt.setMinter(owner.address, true)
      await avt.mint(user0.address, expandDecimals(1000, 18))

      await avt.connect(user0).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(1000, 18))

      await increaseTime(24 * 60 * 60)
      await mineBlock(1)

      expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786, 18))

      expect(await weth.balanceOf(user0.address)).eq(0)
      await feeAvtTracker.connect(user0).claim(user2.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user2.address)).gt(expandDecimals(1785, 18))
      expect(await weth.balanceOf(user2.address)).lt(expandDecimals(1786, 18))
    })
    
    it('users stake0, daoFund stake, claim', async () => {
      await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
      await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
      await avt.setMinter(owner.address, true)
      await avt.mint(daoFund.address, expandDecimals(1000, 18))

      await avt.connect(daoFund).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(daoFund).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(daoFund.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(daoFund.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(1000, 18))

      await increaseTime(24 * 60 * 60)
      await mineBlock(1)

      expect(await feeAvtTracker.claimable(daoFund.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(daoFund.address)).lt(expandDecimals(1786, 18))

      expect(await weth.balanceOf(daoFund.address)).eq(0)
      await feeAvtTracker.connect(daoFund).claim(user2.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user2.address)).gt(expandDecimals(1785, 18))
      expect(await weth.balanceOf(user2.address)).lt(expandDecimals(1786, 18))
    })
    
    it('users stake 1000, daoFund stake 1000, claim', async () => {
      await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
      await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
      await avt.setMinter(owner.address, true)
      await avt.mint(daoFund.address, expandDecimals(1000, 18))
      await avt.mint(user0.address, expandDecimals(1000, 18))

      await avt.connect(user0).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(1000, 18))

      await avt.connect(daoFund).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(daoFund).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(daoFund.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(daoFund.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(2000, 18))

      await increaseTime(24 * 60 * 60)
      await mineBlock(1)

      expect(await feeAvtTracker.claimable(daoFund.address)).gt(expandDecimals(1785, 18).mul(40).div(100)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(daoFund.address)).lt(expandDecimals(1786, 18).mul(40).div(100))
      expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18).mul(60).div(100)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786, 18).mul(60).div(100))

      expect(await weth.balanceOf(daoFund.address)).eq(0)
      await feeAvtTracker.connect(daoFund).claim(user2.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user2.address)).gt(expandDecimals(1785, 18).mul(40).div(100))
      expect(await weth.balanceOf(user2.address)).lt(expandDecimals(1786, 18).mul(40).div(100))
    })
    
    it('users stake 1000 + 1000, daoFund stake 1000, claim', async () => {
      await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
      await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
      await avt.setMinter(owner.address, true)
      await avt.mint(daoFund.address, expandDecimals(1000, 18))
      await avt.mint(user0.address, expandDecimals(1000, 18))
      await avt.mint(user1.address, expandDecimals(1000, 18))

      await avt.connect(user0).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(1000, 18))
      
      await avt.connect(user1).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(user1).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(user1.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(2000, 18))

      await avt.connect(daoFund).approve(feeAvtTracker.address, expandDecimals(1000, 18))
      await feeAvtTracker.connect(daoFund).stake(avt.address, expandDecimals(1000, 18))
      expect(await feeAvtTracker.stakedAmounts(daoFund.address)).eq(expandDecimals(1000, 18))
      expect(await feeAvtTracker.depositBalances(daoFund.address, avt.address)).eq(expandDecimals(1000, 18))

      expect(await feeAvtTracker.totalSupply()).eq(expandDecimals(3000, 18))

      await increaseTime(24 * 60 * 60)
      await mineBlock(1)

      expect(await feeAvtTracker.claimable(daoFund.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(daoFund.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))
      expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))
      expect(await feeAvtTracker.claimable(user1.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000)) // 50000 / 28 => ~1785
      expect(await feeAvtTracker.claimable(user1.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))

      expect(await weth.balanceOf(daoFund.address)).eq(0)
      await feeAvtTracker.connect(daoFund).claim(user2.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user2.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000))
      expect(await weth.balanceOf(user2.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))

      expect(await weth.balanceOf(user0.address)).eq(0)
      await feeAvtTracker.connect(user0).claim(user3.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user3.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000))
      expect(await weth.balanceOf(user3.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))

      expect(await weth.balanceOf(user1.address)).eq(0)
      await feeAvtTracker.connect(user1).claim(user4.address, { gasLimit: 9000000 })
      expect(await weth.balanceOf(user4.address)).gt(expandDecimals(1785, 18).mul(3333).div(10000))
      expect(await weth.balanceOf(user4.address)).lt(expandDecimals(1786, 18).mul(3334).div(10000))
    })

    // it('stake, unstake, claim', async () => {
    //   await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
    //   await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
    //   await avt.setMinter(owner.address, true)
    //   await avt.mint(user0.address, expandDecimals(1000, 18))

    //   await feeAvtTracker.setInPrivateStakingMode(true)
    //   await expect(feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))).to.be.revertedWith(
    //     'RewardTracker: action not enabled',
    //   )

    //   await feeAvtTracker.setInPrivateStakingMode(false)

    //   await expect(feeAvtTracker.connect(user0).stake(user1.address, 0)).to.be.revertedWith(
    //     'RewardTracker: invalid _amount',
    //   )

    //   await expect(feeAvtTracker.connect(user0).stake(user1.address, expandDecimals(1000, 18))).to.be.revertedWith(
    //     'RewardTracker: invalid _depositToken',
    //   )

    //   await expect(feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))).to.be.revertedWith(
    //     'BaseToken: transfer amount exceeds allowance',
    //   )

    //   await avt.connect(user0).approve(feeAvtTracker.address, expandDecimals(1000, 18))
    //   await feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

    //   await increaseTime(24 * 60 * 60)
    //   await mineBlock(1)

    //   expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
    //   expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786, 18))

    //   expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.depositBalances(user0.address, weth.address)).eq(0)
    //   expect(await feeAvtTracker.depositBalances(user1.address, avt.address)).eq(0)
    //   expect(await feeAvtTracker.totalDepositSupply(avt.address)).eq(expandDecimals(1000, 18))

    //   expect(await feeAvtTracker.averageStakedAmounts(user0.address)).eq(0)
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).eq(0)
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).eq(0)
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).eq(0)

    //   await increaseTime(24 * 60 * 60)
    //   await mineBlock(1)

    //   expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786 + 1191, 18))

    //   expect(await feeAvtTracker.claimable(user1.address)).gt(expandDecimals(595, 18))
    //   expect(await feeAvtTracker.claimable(user1.address)).lt(expandDecimals(596, 18))

    //   await expect(feeAvtTracker.connect(user0).unstake(weth.address, expandDecimals(1001, 18))).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds stakedAmount',
    //   )

    //   await expect(feeAvtTracker.connect(user0).unstake(weth.address, expandDecimals(1000, 18))).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds depositBalance',
    //   )

    //   await expect(feeAvtTracker.connect(user0).unstake(avt.address, expandDecimals(1001, 18))).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds stakedAmount',
    //   )

    //   expect(await avt.balanceOf(user0.address)).eq(0)
    //   await feeAvtTracker.connect(user0).unstake(avt.address, expandDecimals(1000, 18))
    //   expect(await avt.balanceOf(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.totalDepositSupply(avt.address)).eq(0)
    //   expect(await feeAvtTracker.totalDepositSupply(weth.address)).eq(expandDecimals(500, 18))

    //   expect(await feeAvtTracker.averageStakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).lt(expandDecimals(1786 + 1191, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).eq(0)
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).eq(0)

    //   await expect(feeAvtTracker.connect(user0).unstake(avt.address, 1)).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds stakedAmount',
    //   )

    //   expect(await weth.balanceOf(user0.address)).eq(0)
    //   await feeAvtTracker.connect(user0).claim(user2.address)
    //   expect(await weth.balanceOf(user2.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await weth.balanceOf(user2.address)).lt(expandDecimals(1786 + 1191, 18))

    //   await increaseTime(24 * 60 * 60)
    //   await mineBlock(1)

    //   expect(await feeAvtTracker.claimable(user0.address)).eq(0)

    //   expect(await feeAvtTracker.claimable(user1.address)).gt(expandDecimals(595 + 1785, 18))
    //   expect(await feeAvtTracker.claimable(user1.address)).lt(expandDecimals(596 + 1786, 18))

    //   await avt.mint(user1.address, expandDecimals(300, 18))
    //   await avt.connect(user1).approve(feeAvtTracker.address, expandDecimals(300, 18))
    //   await feeAvtTracker.connect(user1).stake(avt.address, expandDecimals(300, 18))
    //   expect(await feeAvtTracker.totalDepositSupply(avt.address)).eq(expandDecimals(300, 18))
    //   expect(await feeAvtTracker.totalDepositSupply(weth.address)).eq(expandDecimals(500, 18))

    //   expect(await feeAvtTracker.averageStakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).lt(expandDecimals(1786 + 1191, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).eq(expandDecimals(500, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).gt(expandDecimals(595 + 1785, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).lt(expandDecimals(596 + 1786, 18))

    //   await expect(feeAvtTracker.connect(user1).unstake(avt.address, expandDecimals(301, 18))).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds depositBalance',
    //   )

    //   await expect(feeAvtTracker.connect(user1).unstake(weth.address, expandDecimals(501, 18))).to.be.revertedWith(
    //     'RewardTracker: _amount exceeds depositBalance',
    //   )

    //   await increaseTime(2 * 24 * 60 * 60)
    //   await mineBlock(1)

    //   await feeAvtTracker.connect(user0).claim(user2.address)
    //   await feeAvtTracker.connect(user1).claim(user3.address)

    //   expect(await feeAvtTracker.averageStakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).lt(expandDecimals(1786 + 1191, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).gt(expandDecimals(679, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).lt(expandDecimals(681, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).gt(expandDecimals(595 + 1785 + 1785 * 2, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).lt(expandDecimals(596 + 1786 + 1786 * 2, 18))

    //   await increaseTime(2 * 24 * 60 * 60)
    //   await mineBlock(1)

    //   await feeAvtTracker.connect(user0).claim(user2.address)
    //   await feeAvtTracker.connect(user1).claim(user3.address)

    //   expect(await feeAvtTracker.averageStakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).gt(expandDecimals(1785 + 1190, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user0.address)).lt(expandDecimals(1786 + 1191, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).gt(expandDecimals(724, 18))
    //   expect(await feeAvtTracker.averageStakedAmounts(user1.address)).lt(expandDecimals(726, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).gt(expandDecimals(595 + 1785 + 1785 * 4, 18))
    //   expect(await feeAvtTracker.cumulativeRewards(user1.address)).lt(expandDecimals(596 + 1786 + 1786 * 4, 18))

    //   expect(await weth.balanceOf(user2.address)).eq(await feeAvtTracker.cumulativeRewards(user0.address))
    //   expect(await weth.balanceOf(user3.address)).eq(await feeAvtTracker.cumulativeRewards(user1.address))

    //   expect(await avt.balanceOf(user1.address)).eq(0)
    //   expect(await weth.balanceOf(user1.address)).eq(0)
    //   await feeAvtTracker.connect(user1).unstake(avt.address, expandDecimals(300, 18))
    //   expect(await avt.balanceOf(user1.address)).eq(expandDecimals(300, 18))
    //   expect(await weth.balanceOf(user1.address)).eq(0)
    //   await feeAvtTracker.connect(user1).unstake(weth.address, expandDecimals(500, 18))
    //   expect(await avt.balanceOf(user1.address)).eq(expandDecimals(300, 18))
    //   expect(await weth.balanceOf(user1.address)).eq(expandDecimals(500, 18))
    //   expect(await feeAvtTracker.totalDepositSupply(avt.address)).eq(0)
    //   expect(await feeAvtTracker.totalDepositSupply(weth.address)).eq(0)

    //   await feeAvtTracker.connect(user0).claim(user2.address)
    //   await feeAvtTracker.connect(user1).claim(user3.address)

    //   const distributed = expandDecimals(50000, 18).sub(await weth.balanceOf(feeAvtRewardDistributor.address))
    //   const cumulativeReward0 = await feeAvtTracker.cumulativeRewards(user0.address)
    //   const cumulativeReward1 = await feeAvtTracker.cumulativeRewards(user1.address)
    //   const totalCumulativeReward = cumulativeReward0.add(cumulativeReward1)

    //   expect(distributed).gt(totalCumulativeReward.sub(expandDecimals(1, 18)))
    //   expect(distributed).lt(totalCumulativeReward.add(expandDecimals(1, 18)))
    // })

    // it('stakeForAccount, unstakeForAccount, claimForAccount', async () => {
    //   await weth.transfer(feeAvtRewardDistributor.address, expandDecimals(50000, 18))
    //   await feeAvtRewardDistributor.setTokensPerInterval('20667989410000000') // 0.02066798941 weth per second
    //   await avt.setMinter(owner.address, true)
    //   await avt.mint(owner.address, expandDecimals(1000, 18))

    //   await feeAvtTracker.setInPrivateStakingMode(true)
    //   await expect(feeAvtTracker.connect(user0).stake(avt.address, expandDecimals(1000, 18))).to.be.revertedWith(
    //     'RewardTracker: action not enabled',
    //   )

    //   await expect(
    //     feeAvtTracker
    //       .connect(user2)
    //       .stakeForAccount(owner.address, user0.address, avt.address, expandDecimals(1000, 18)),
    //   ).to.be.revertedWith('RewardTracker: forbidden')

    //   await feeAvtTracker.setHandler(user2.address, true)
    //   await expect(
    //     feeAvtTracker
    //       .connect(user2)
    //       .stakeForAccount(owner.address, user0.address, avt.address, expandDecimals(1000, 18)),
    //   ).to.be.revertedWith('BaseToken: transfer amount exceeds allowance')

    //   await avt.connect(owner).approve(feeAvtTracker.address, expandDecimals(1000, 18))

    //   await feeAvtTracker
    //     .connect(user2)
    //     .stakeForAccount(owner.address, user0.address, avt.address, expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

    //   await increaseTime(24 * 60 * 60)
    //   await mineBlock(1)

    //   expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
    //   expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1786, 18))

    //   await feeAvtTracker.setHandler(user2.address, false)
    //   await expect(
    //     feeAvtTracker
    //       .connect(user2)
    //       .unstakeForAccount(user0.address, weth.address, expandDecimals(1000, 18), user1.address),
    //   ).to.be.revertedWith('RewardTracker: forbidden')

    //   await feeAvtTracker.setHandler(user2.address, true)

    //   await expect(
    //     feeAvtTracker
    //       .connect(user2)
    //       .unstakeForAccount(user0.address, weth.address, expandDecimals(1000, 18), user1.address),
    //   ).to.be.revertedWith('RewardTracker: _amount exceeds depositBalance')

    //   await expect(
    //     feeAvtTracker
    //       .connect(user2)
    //       .unstakeForAccount(user0.address, avt.address, expandDecimals(1001, 18), user1.address),
    //   ).to.be.revertedWith('RewardTracker: _amount exceeds stakedAmount')

    //   expect(await avt.balanceOf(user0.address)).eq(0)
    //   expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(1000, 18))

    //   expect(await feeAvtTracker.balanceOf(user0.address)).eq(expandDecimals(1000, 18))
    //   await feeAvtTracker.connect(user0).transfer(user1.address, expandDecimals(50, 18))
    //   expect(await feeAvtTracker.balanceOf(user0.address)).eq(expandDecimals(950, 18))
    //   expect(await feeAvtTracker.balanceOf(user1.address)).eq(expandDecimals(50, 18))

    //   await feeAvtTracker.setInPrivateTransferMode(true)
    //   await expect(feeAvtTracker.connect(user0).transfer(user1.address, expandDecimals(50, 18))).to.be.revertedWith(
    //     'RewardTracker: forbidden',
    //   )

    //   await feeAvtTracker.setHandler(user2.address, false)
    //   await expect(
    //     feeAvtTracker.connect(user2).transferFrom(user1.address, user0.address, expandDecimals(50, 18)),
    //   ).to.be.revertedWith('RewardTracker: transfer amount exceeds allowance')

    //   await feeAvtTracker.setHandler(user2.address, true)
    //   await feeAvtTracker.connect(user2).transferFrom(user1.address, user0.address, expandDecimals(50, 18))
    //   expect(await feeAvtTracker.balanceOf(user0.address)).eq(expandDecimals(1000, 18))
    //   expect(await feeAvtTracker.balanceOf(user1.address)).eq(0)

    //   await feeAvtTracker
    //     .connect(user2)
    //     .unstakeForAccount(user0.address, avt.address, expandDecimals(100, 18), user1.address)

    //   expect(await avt.balanceOf(user1.address)).eq(expandDecimals(100, 18))
    //   expect(await feeAvtTracker.stakedAmounts(user0.address)).eq(expandDecimals(900, 18))
    //   expect(await feeAvtTracker.depositBalances(user0.address, avt.address)).eq(expandDecimals(900, 18))

    //   await expect(feeAvtTracker.connect(user3).claimForAccount(user0.address, user3.address)).to.be.revertedWith(
    //     'RewardTracker: forbidden',
    //   )

    //   expect(await feeAvtTracker.claimable(user0.address)).gt(expandDecimals(1785, 18))
    //   expect(await feeAvtTracker.claimable(user0.address)).lt(expandDecimals(1787, 18))
    //   expect(await weth.balanceOf(user0.address)).eq(0)
    //   expect(await weth.balanceOf(user3.address)).eq(0)

    //   await feeAvtTracker.connect(user2).claimForAccount(user0.address, user3.address)

    //   expect(await feeAvtTracker.claimable(user0.address)).eq(0)
    //   expect(await weth.balanceOf(user3.address)).gt(expandDecimals(1785, 18))
    //   expect(await weth.balanceOf(user3.address)).lt(expandDecimals(1787, 18))
    // })
  })
})
