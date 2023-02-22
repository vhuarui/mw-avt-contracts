import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedAlpTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('StakedAlpTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Fee + Staked ALP', 'fsALP'],
  })

  console.log('StakedAlpTracker deployed at ', address)

  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')

  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')

  await sendTxn(stakedAlpTracker.setInPrivateTransferMode(true), "stakedAlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedAlpTracker.setInPrivateStakingMode(true), "stakedAlpTracker.setInPrivateStakingMode")

  
  // allow stakedAlpTracker to stake feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(stakedAlpTracker.address, true), "feeAlpTracker.setHandler(stakedAlpTracker)")
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'StakedAlpTracker']
