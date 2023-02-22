import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running StakedAvtDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const stakedAvtTracker = await ethers.getContract('StakedAvtTracker')
  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')
  const avt = await ethers.getContract('AVT')

  const { address } = await deploy('StakedAvtDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [avt.address, stakedAvtTracker.address],
  })

  console.log('StakedAvtDistributor deployed at ', address)

  const stakedAvtDistributor = await ethers.getContract('StakedAvtDistributor')
  if (!(await stakedAvtTracker.isInitialized())) {
    await sendTxn(
      stakedAvtTracker.initialize([feeAvtTracker.address], stakedAvtDistributor.address),
      'stakedAvtTracker.initialize',
    )
  } else {
    console.log('StakedAvtTracker already initialized')
  }
}

export default deployFunction

deployFunction.dependencies = ['StakedAvtTracker']

deployFunction.tags = ['Stake', 'StakedAvtDistributor']
