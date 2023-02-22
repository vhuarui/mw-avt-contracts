import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../../utils/helper'
import { contractConfigs } from '../../config/contractConfigs'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running FeeAvtDistributor deploy script')
  const { deploy } = deployments

  const { deployer, daoFund } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  console.log('daoFund', daoFund)
  const tokens = require('../../config/tokens.json')[network.name]
  const { nativeToken } = tokens

  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')
  const avt = await ethers.getContract('AVT')

  const { address } = await deploy('FeeAvtDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nativeToken.address, feeAvtTracker.address],
  })

  console.log('FeeAvtDistributor deployed at ', address)

  const feeAvtDistributor = await ethers.getContract('FeeAvtDistributor')
  if (!(await feeAvtTracker.isInitialized())) {
    await sendTxn(
      feeAvtTracker.initialize([avt.address], feeAvtDistributor.address, daoFund),
      'feeAvtTracker.initialize',
    )
  } else {
    console.log('FeeAvtTracker already initialized')
  }
}

export default deployFunction

deployFunction.dependencies = ['AVT', 'FeeAvtTracker']

deployFunction.tags = ['Stake', 'FeeAvtDistributor']
