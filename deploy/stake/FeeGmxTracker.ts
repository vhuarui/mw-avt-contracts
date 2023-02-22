import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeAvtTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('FeeAvtTracker', {
    contract: 'FeeAvtRewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args:  ["Fee AVT", "fAVT"],
  })

  console.log('FeeAvtTracker deployed at ', address)

  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')

  await sendTxn(feeAvtTracker.setInPrivateTransferMode(true), 'feeAvtTracker.setInPrivateTransferMode')
  await sendTxn(feeAvtTracker.setInPrivateStakingMode(true), 'feeAvtTracker.setInPrivateStakingMode')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'FeeAvtTracker']
