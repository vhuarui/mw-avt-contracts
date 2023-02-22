import { expect } from 'chai'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { randomHex } from './utils/encoding'
import { faucet } from './utils/impersonate'
import { mine, time, takeSnapshot, SnapshotRestorer } from '@nomicfoundation/hardhat-network-helpers'
import { AVT, TokenVesting } from '../typechain'
import { constants, Wallet } from 'ethers'
import { Address } from 'hardhat-deploy/types'
import { deployContract } from './utils/contracts'

describe('Token Vesting', async function () {
  let owner: any
  let user0: Wallet
  let user1: Wallet
  let user2: Wallet

  const { provider } = ethers
  // after(async () => {
  //   console.log('reset')
  //   await network.provider.request({
  //     method: 'hardhat_reset',
  //   })
  // })
  before('', async function () {
    owner = await ethers.getNamedSigner('deployer')
    // console.log('owner', owner.address)
    user0 = new ethers.Wallet(randomHex(32), provider)
    user1 = new ethers.Wallet(randomHex(32), provider)
    user2 = new ethers.Wallet(randomHex(32), provider)

    await Promise.all([owner, user0, user1, user2].map((wallet) => faucet(wallet.address, provider)))
  })

  describe('', function () {
    let tokens: { [x: string]: { address: any } }
    let snapshot: SnapshotRestorer

    let avt: AVT
    let tokenVesting: TokenVesting

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
      await network.provider.request({
        method: 'hardhat_reset',
      })

      avt = (await deployContract('AVT', owner)) as AVT
      tokenVesting = (await deployContract('TokenVesting', owner, avt.address)) as TokenVesting

      await avt.setMinter(owner.address, true)
      await avt.mint(owner.address, parseUnits('1000000'))

      snapshot = await takeSnapshot()

      tokens = require('../config/tokens.json')[network.name]
    })
    beforeEach(async () => {
      await snapshot.restore()
    })
    after(async () => {
      await snapshot.restore()
    })

    it('inits', async () => {
      expect(await tokenVesting.vestingToken()).eq(avt.address)
    })

    it('Create Vesting', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      const beforeOwnerBalance = await avt.balanceOf(owner.address)
      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.id).eq(0)
      expect(vesting.amounts).eq(parseUnits('1'))
      expect(vesting.beneficiary).eq(user0.address)
      expect(vesting.start).eq(startTimestamp)
      expect(vesting.duration).eq(durationSeconds)
      expect(vesting.released).eq(0)

      const nowOwnerBalance = await avt.balanceOf(owner.address)
      expect(beforeOwnerBalance.sub(nowOwnerBalance)).eq(vestingAmounts)

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      expect(nowContractBalance).eq(vestingAmounts)
    })
    it('Edit Vesting', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      const newVestingAmounts = parseUnits('3')
      const newStartTimestamp = startTimestamp + time.duration.days(1)
      const newDurationSeconds = time.duration.days(20)

      const beforeOwnerBalance = await avt.balanceOf(owner.address)
      await avt.approve(tokenVesting.address, newVestingAmounts)
      await tokenVesting.editVesting(0, newVestingAmounts, user1.address, newStartTimestamp, newDurationSeconds)

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.id).eq(0)
      expect(vesting.amounts).eq(newVestingAmounts)
      expect(vesting.beneficiary).eq(user1.address)
      expect(vesting.start).eq(newStartTimestamp)
      expect(vesting.duration).eq(newDurationSeconds)
      expect(vesting.released).eq(0)

      const nowOwnerBalance = await avt.balanceOf(owner.address)
      expect(beforeOwnerBalance.sub(nowOwnerBalance)).eq(newVestingAmounts.sub(vestingAmounts))

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      expect(nowContractBalance).eq(newVestingAmounts)
    })
    it('Releasable', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await time.increaseTo(startTimestamp + time.duration.days(1))
      const releasable = await tokenVesting.releasable(0)

      expect(releasable).eq(vestingAmounts.mul(time.duration.days(1)).div(durationSeconds))
    })

    it('Release', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(2))
      await tokenVesting.release(0)

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      const nowUserBalance = await avt.balanceOf(user0.address)
      const released = vestingAmounts.mul(time.duration.days(2)).div(durationSeconds)
      expect(nowContractBalance).eq(vestingAmounts.sub(released))
      expect(nowUserBalance).eq(released)

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.released).eq(released)
    })

    it('Two Release', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(2))
      await tokenVesting.release(0)

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      const released = vestingAmounts.mul(time.duration.days(2)).div(durationSeconds)
      expect(nowContractBalance).eq(vestingAmounts.sub(released))

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.released).eq(released)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(3))
      await tokenVesting.release(0)

      const nowContractBalance2 = await avt.balanceOf(tokenVesting.address)
      const released2 = vestingAmounts.mul(time.duration.days(3)).div(durationSeconds)
      expect(nowContractBalance2).eq(vestingAmounts.sub(released2))

      const vesting2 = await tokenVesting.getVestingAt(0)
      expect(vesting2.released).eq(released2)
    })

    it('ReleaseByBeneficiary', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(2))
      await tokenVesting.releaseByBeneficiary(user0.address)

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      const released = vestingAmounts.mul(time.duration.days(2)).div(durationSeconds)
      expect(nowContractBalance).eq(vestingAmounts.sub(released).mul(2))

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.released).eq(released)
      const vesting1 = await tokenVesting.getVestingAt(1)
      expect(vesting1.released).eq(released)

      expect(await avt.balanceOf(user0.address)).eq(released.mul(2))
    })

    it('Release -> Edit, vested less than released -> Release', async function () {
      const vestingAmounts = parseUnits('1')
      const startTimestamp = await time.latest()
      const durationSeconds = time.duration.days(10)

      await avt.approve(tokenVesting.address, vestingAmounts)
      await tokenVesting.createVesting(vestingAmounts, user0.address, startTimestamp, durationSeconds)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(2))
      await tokenVesting.release(0)

      const nowContractBalance = await avt.balanceOf(tokenVesting.address)
      const released = vestingAmounts.mul(time.duration.days(2)).div(durationSeconds)
      expect(nowContractBalance).eq(vestingAmounts.sub(released))

      const vesting = await tokenVesting.getVestingAt(0)
      expect(vesting.released).eq(released)

      const newVestingAmounts = parseUnits('1')
      const newDurationSeconds = durationSeconds * 2
      await tokenVesting.editVesting(0, newVestingAmounts, user0.address, startTimestamp, newDurationSeconds)

      await time.increaseTo(startTimestamp + time.duration.days(3))
      const releasable = await tokenVesting.releasable(0)
      expect(releasable).eq(0)

      await time.setNextBlockTimestamp(startTimestamp + time.duration.days(4))
      const released2 = newVestingAmounts.mul(time.duration.days(4)).div(newDurationSeconds)
      await tokenVesting.release(0)
      const vesting2 = await tokenVesting.getVestingAt(0)
      expect(vesting2.released).eq(released)
    })
  })
})
