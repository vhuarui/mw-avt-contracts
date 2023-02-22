import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedAlpDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const avt = await ethers.getContract('AVT')
  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')
  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')
  const { address } = await deploy('StakedAlpDistributor', {
    contract: 'StakedAlpRewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [avt.address, stakedAlpTracker.address],
  })

  console.log('StakedAlpDistributor deployed at ', address)

  const stakedAlpDistributor = await ethers.getContract('StakedAlpDistributor')
  if (!(await stakedAlpTracker.isInitialized())) {
    await sendTxn(
      stakedAlpTracker.initialize([feeAlpTracker.address], stakedAlpDistributor.address),
      'stakedAlpTracker.initialize',
    )
  } else {
    console.log('StakedAlpTracker already initialized')
  }
}

export default deployFunction

deployFunction.dependencies = ['StakedAlpTracker']

deployFunction.tags = ['Stake', 'StakedAlpDistributor']
