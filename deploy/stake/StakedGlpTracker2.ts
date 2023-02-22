import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedAlpTracker2 deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('StakedAlpTracker2', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Fee + Staked ALP 2', 'fsALP2'],
  })

  console.log('StakedAlpTracker2 deployed at ', address)

  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')
  const stakedAlpTracker2 = await ethers.getContract('StakedAlpTracker2')

  await sendTxn(stakedAlpTracker2.setInPrivateTransferMode(true), 'stakedAlpTracker2.setInPrivateTransferMode')
  await sendTxn(stakedAlpTracker2.setInPrivateStakingMode(true), 'stakedAlpTracker2.setInPrivateStakingMode')

  // allow stakedAlpTracker to stake stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(stakedAlpTracker2.address, true), 'feeAlpTracker.setHandler(stakedAlpTracker)')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'StakedAlpTracker2']
