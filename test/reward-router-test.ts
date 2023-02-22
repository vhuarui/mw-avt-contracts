import { expect } from 'chai'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { AddressZero } from '@ethersproject/constants'
import { deployments, ethers, network } from 'hardhat'
import { TestERC20 } from '../typechain/contracts/Test/TestERC20'
import { randomHex } from './utils/encoding'
import { fixtureERC20 } from './utils/fixtures/tokens'
import { faucet } from './utils/impersonate'
import { mine, time, takeSnapshot, SnapshotRestorer } from '@nomicfoundation/hardhat-network-helpers'
import {
  BonusDistributor,
  ALP,
  AlpManager,
  AVT,
  RewardRouterV2,
  RewardTracker,
  StakedAlpRewardDistributor,
  StakedAlpRewardDistributor2,
} from '../typechain'
import { constants, Wallet } from 'ethers'
import { Address } from 'hardhat-deploy/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('Initial', async function () {
  let owner: SignerWithAddress
  let from: Wallet
  let to: Wallet
  let caller: Wallet
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
    from = new ethers.Wallet(randomHex(32), provider)
    to = new ethers.Wallet(randomHex(32), provider)
    caller = new ethers.Wallet(randomHex(32), provider)

    await Promise.all([owner, from, to, caller].map((wallet) => faucet(wallet.address, provider)))
  })

  describe('Reward Router', function () {
    let tokens: { [x: string]: { address: any } }
    let tokenSnapshot: SnapshotRestorer
    let mintAndApproveERC20: any

    let avt: AVT
    let alp: ALP
    let rewardRouterV2: RewardRouterV2
    let feeAlpTracker: RewardTracker
    let stakedAlpTracker: RewardTracker
    let stakedAlpTracker2: RewardTracker
    let alpManager: AlpManager

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

    before('', async function () {
      avt = (await ethers.getContract('AVT')) as AVT
      alp = (await ethers.getContract('ALP')) as ALP
      alpManager = (await ethers.getContract('AlpManager')) as AlpManager
      rewardRouterV2 = (await ethers.getContract('RewardRouterV2')) as RewardRouterV2
      feeAlpTracker = (await ethers.getContract('FeeAlpTracker')) as RewardTracker
      stakedAlpTracker = (await ethers.getContract('StakedAlpTracker')) as RewardTracker
      stakedAlpTracker2 = (await ethers.getContract('StakedAlpTracker2')) as RewardTracker

      const distributor1 = (await ethers.getContract('StakedAlpDistributor')) as StakedAlpRewardDistributor
      const distributor2 = (await ethers.getContract('StakedAlpDistributor2')) as StakedAlpRewardDistributor2

      await distributor1.updateLastDistributionTime()
      await distributor2.updateLastDistributionTime()
      await distributor1.setTokensPerIntervals(
        parseUnits('1000000'),
        parseUnits('3000000'),
        parseUnits('6000000'),
        parseUnits('10000000'),
      )
      await distributor2.setMaxTokensPerInterval(parseUnits('100000000'))

      await avt.setMinter(owner.address, true)
      await avt.mint(distributor1.address, parseUnits('10000000').mul(10000))
      await avt.mint(distributor2.address, parseUnits('10000000').mul(10000))

      tokenSnapshot = await takeSnapshot()

      tokens = require('../config/tokens.json')[network.name]
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })
    after(async () => {
      await tokenSnapshot.restore()
    })

    it('Stake Alp', async function () {
      // await alp.setMinter(owner.address, true)
      // await alp.mint(owner.address, parseUnits('1000000', await alp.decimals()))

      await alp.approve(alpManager.address, constants.MaxUint256)

      const btc = (await ethers.getContractAt('TestERC20', tokens['btc'].address)) as TestERC20
      await btc.mint(caller.address, parseUnits('10000000', await btc.decimals()))

      await btc.connect(caller).approve(alpManager.address, constants.MaxUint256)

      // await rewardRouterV2.setStakedAlpEnable(false)
      await rewardRouterV2.connect(caller).mintAndStakeAlp(btc.address, parseUnits('100', await btc.decimals()), 0, 0)

      await getTotalSupply('alp', alp)
      await getTotalSupply('feeAlpTracker', feeAlpTracker)
      await getTotalSupply('stakedAlpTracker', stakedAlpTracker)
      await getTotalSupply('stakedAlpTracker2', stakedAlpTracker2)

      await getBalance('alp', alp, caller.address)
      await getBalance('feeAlpTracker', feeAlpTracker, caller.address)
      await getBalance('stakedAlpTracker', stakedAlpTracker, caller.address)
      await getBalance('stakedAlpTracker2', stakedAlpTracker2, caller.address)
    })
    it('UnStake Alp', async function () {
      await alp.approve(alpManager.address, constants.MaxUint256)

      const btc = (await ethers.getContractAt('TestERC20', tokens['btc'].address)) as TestERC20
      await btc.mint(caller.address, parseUnits('10000000', await btc.decimals()))

      await btc.connect(caller).approve(alpManager.address, constants.MaxUint256)

      // await rewardRouterV2.setStakedAlpEnable(false)
      await rewardRouterV2.connect(caller).mintAndStakeAlp(btc.address, parseUnits('100', await btc.decimals()), 0, 0)

      await getTotalSupply('alp', alp)
      await getTotalSupply('feeAlpTracker', feeAlpTracker)
      await getTotalSupply('stakedAlpTracker', stakedAlpTracker)
      await getTotalSupply('stakedAlpTracker2', stakedAlpTracker2)

      await getBalance('alp', alp, caller.address)
      await getBalance('feeAlpTracker', feeAlpTracker, caller.address)
      await getBalance('stakedAlpTracker', stakedAlpTracker, caller.address)
      await getBalance('stakedAlpTracker2', stakedAlpTracker2, caller.address)

      await time.increase(15 * 60)
      await rewardRouterV2
        .connect(caller)
        .unstakeAndRedeemAlp(
          btc.address,
          await getBalance('stakedAlpTracker2', stakedAlpTracker2, caller.address),
          0,
          caller.address,
        )

      await getTotalSupply('alp', alp)
      await getTotalSupply('feeAlpTracker', feeAlpTracker)
      await getTotalSupply('stakedAlpTracker', stakedAlpTracker)
      await getTotalSupply('stakedAlpTracker2', stakedAlpTracker2)
    })
    it('Claim StakedAlp reward AVT', async function () {
      await alp.approve(alpManager.address, constants.MaxUint256)

      const btc = (await ethers.getContractAt('TestERC20', tokens['btc'].address)) as TestERC20
      await btc.mint(caller.address, parseUnits('10000000', await btc.decimals()))

      await btc.connect(caller).approve(alpManager.address, constants.MaxUint256)

      // await rewardRouterV2.setStakedAlpEnable(false)
      await rewardRouterV2.connect(caller).mintAndStakeAlp(btc.address, parseUnits('100', await btc.decimals()), 0, 0)

      const tokensPerInterval = await stakedAlpTracker.tokensPerInterval()
      console.log('tokensPerInterval', formatUnits(tokensPerInterval))

      const distributor1 = (await ethers.getContract('StakedAlpDistributor')) as BonusDistributor
      console.log('last distributor', (await distributor1.lastDistributionTime()).toString())
      await time.setNextBlockTimestamp((await distributor1.lastDistributionTime()).add(20))

      await rewardRouterV2.connect(caller).handleRewards(false, true, false, false, false)

      await getBalance('avt', avt, caller.address)
      await getBalance('alp', alp, caller.address)
      await getBalance('feeAlpTracker', feeAlpTracker, caller.address)
      await getBalance('stakedAlpTracker', stakedAlpTracker, caller.address)
      await getBalance('stakedAlpTracker2', stakedAlpTracker2, caller.address)
    })
  })
})
