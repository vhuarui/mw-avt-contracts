import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running access update script')
  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const timelock = await ethers.getContract('Timelock')
  const alpManager = await ethers.getContract('AlpManager')
  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')
  const stakedAvtTracker = await ethers.getContract('StakedAvtTracker')
  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')
  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')
  const stakedAlpTracker2 = await ethers.getContract('StakedAlpTracker2')

  const updateRewardTrackerGov = async (rewardTracker: any, label: any) => {
    const distributorAddress = await rewardTracker.distributor()
    const distributor = await ethers.getContractAt('RewardDistributor', distributorAddress)
    await sendTxn(rewardTracker.setGov(timelock.address), `${label}.setGov`)
    await sendTxn(distributor.setGov(timelock.address), `${label}.distributor.setGov`)
  }

  const updateGov = async (contract: any, label: any) => {
    await sendTxn(contract.setGov(timelock.address), `${label}.setGov`)
  }

  await updateRewardTrackerGov(feeAvtTracker, 'feeAvtTracker')
  await updateRewardTrackerGov(stakedAvtTracker, 'stakedAvtTracker')
  await updateRewardTrackerGov(feeAlpTracker, 'feeAlpTracker')
  await updateRewardTrackerGov(stakedAlpTracker, 'stakedAlpTracker')
  await updateRewardTrackerGov(stakedAlpTracker2, 'stakedAlpTracker2')

  await updateGov(alpManager, 'alpManager')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'UpdateAccess']
