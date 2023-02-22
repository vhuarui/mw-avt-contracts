import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({network, deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeAlpDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const tokens = require('../../config/tokens.json')[network.name || 'fantomtest']
  const { nativeToken } = tokens

  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')
  const { address } = await deploy('FeeAlpDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nativeToken.address, feeAlpTracker.address],
  })

  console.log('FeeAlpDistributor deployed at ', address)

  const alp = await ethers.getContract('ALP')
  const feeAlpDistributor = await ethers.getContract('FeeAlpDistributor')
  if (!(await feeAlpTracker.isInitialized())) {
    await sendTxn(feeAlpTracker.initialize([alp.address], feeAlpDistributor.address), 'feeAlpTracker.initialize')
  } else {
    console.log('FeeAlpTracker already initialized')
  }
}

export default deployFunction

deployFunction.dependencies = ['FeeAlpTracker']

deployFunction.tags = ['Stake', 'FeeAlpDistributor']
