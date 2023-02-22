import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeAlpTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('FeeAlpTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Fee ALP', 'fALP'],
  })

  console.log('FeeAlpTracker deployed at ', address)

  const alp = await ethers.getContract('ALP')
  const alpManager = await ethers.getContract('AlpManager')
  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')

  await sendTxn(alpManager.setInPrivateMode(true), 'alpManager.setInPrivateMode')
  await sendTxn(feeAlpTracker.setInPrivateTransferMode(true), 'feeAlpTracker.setInPrivateTransferMode')
  await sendTxn(feeAlpTracker.setInPrivateStakingMode(true), 'feeAlpTracker.setInPrivateStakingMode')

  // allow feeAlpTracker to stake alp
  await sendTxn(alp.setHandler(feeAlpTracker.address, true), 'alp.setHandler(feeAlpTracker)')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'FeeAlpTracker']
