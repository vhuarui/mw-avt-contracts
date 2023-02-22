import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running ALP deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('ALP', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('ALP deployed at ', address)

  const alp = await ethers.getContract('ALP')
  await sendTxn(alp.setInPrivateTransferMode(true), 'alp.setInPrivateTransferMode')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['ALP']
