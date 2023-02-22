import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedAlpDistributor2 deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const avt = await ethers.getContract('AVT')
  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')
  const stakedAlpTracker2 = await ethers.getContract('StakedAlpTracker2')
  const { address } = await deploy('StakedAlpDistributor2', {
    contract: 'StakedAlpRewardDistributor2',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [avt.address, stakedAlpTracker2.address],
  })

  console.log('StakedAlpDistributor2 deployed at ', address)

  const stakedAlpDistributor2 = await ethers.getContract('StakedAlpDistributor2')
  if (!(await stakedAlpTracker2.isInitialized())) {
    await sendTxn(
      stakedAlpTracker2.initialize([stakedAlpTracker.address], stakedAlpDistributor2.address),
      'stakedAlpTracker2.initialize',
    )
  } else {
    console.log('StakedAlpTracker2 already initialized')
  }
}

export default deployFunction

deployFunction.dependencies = ['StakedAlpTracker2']

deployFunction.tags = ['Stake', 'StakedAlpDistributor2']
