import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedAvtTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('StakedAvtTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Staked AVT', 'sAVT'],
  })

  console.log('StakedAvtTracker deployed at ', address)

  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')
  const stakedAvtTracker = await ethers.getContract('StakedAvtTracker')

  await sendTxn(stakedAvtTracker.setInPrivateTransferMode(true), 'stakedAvtTracker.setInPrivateTransferMode')
  await sendTxn(stakedAvtTracker.setInPrivateStakingMode(true), 'stakedAvtTracker.setInPrivateStakingMode')

  await sendTxn(feeAvtTracker.setHandler(stakedAvtTracker.address, true), "feeAvtTracker.setHandler(stakedAvtTracker)")
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'StakedAvtTracker']
