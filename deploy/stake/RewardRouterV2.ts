import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running RewardRouterV2 deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const tokens = require('../../config/tokens.json')[network.name || 'fantomtest']
  const { nativeToken } = tokens

  const { address } = await deploy('RewardRouterV2', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('RewardRouterV2 deployed at ', address)

  const rewardRouter = await ethers.getContract('RewardRouterV2')

  const alp = await ethers.getContract('ALP')
  const alpManager = await ethers.getContract('AlpManager')

  const avt = await ethers.getContract('AVT')

  const stakedAvtTracker = await ethers.getContract('StakedAvtTracker')
  const feeAvtTracker = await ethers.getContract('FeeAvtTracker')

  const feeAlpTracker = await ethers.getContract('FeeAlpTracker')
  const stakedAlpTracker = await ethers.getContract('StakedAlpTracker')
  const stakedAlpTracker2 = await ethers.getContract('StakedAlpTracker2')

  if (!(await rewardRouter.isInitialized())) {
    await sendTxn(
      rewardRouter.initialize(
        nativeToken.address,
        avt.address,
        alp.address,
        stakedAvtTracker.address,
        feeAvtTracker.address,
        feeAlpTracker.address,
        stakedAlpTracker.address,
        stakedAlpTracker2.address,
        alpManager.address,
      ),
      'rewardRouter.initialize',
    )
  } else {
    console.log('RewardRouter already initialized')
  }

  await sendTxn(alpManager.setHandler(rewardRouter.address, true), 'alpManager.setHandler(rewardRouter)')

  // allow rewardRouter to stake in stakedAvtTracker
  await sendTxn(stakedAvtTracker.setHandler(rewardRouter.address, true), 'stakedAvtTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in feeAvtTracker
  await sendTxn(feeAvtTracker.setHandler(rewardRouter.address, true), 'feeAvtTracker.setHandler(rewardRouter)')

  // allow rewardRouter to stake in feeAlpTracker
  await sendTxn(feeAlpTracker.setHandler(rewardRouter.address, true), 'feeAlpTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in stakedAlpTracker
  await sendTxn(stakedAlpTracker.setHandler(rewardRouter.address, true), 'stakedAlpTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in stakedAlpTracker2
  await sendTxn(stakedAlpTracker2.setHandler(rewardRouter.address, true), 'stakedAlpTracker2.setHandler(rewardRouter)')
}

export default deployFunction

deployFunction.dependencies = ['StakedAlpTracker', 'StakedAlpTracker2', 'StakedAvtTracker']

deployFunction.tags = ['Stake', 'RewardRouterV2']
