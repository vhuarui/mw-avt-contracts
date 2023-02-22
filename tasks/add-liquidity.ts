import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { AlpManager, RewardRouterV2, RewardTracker } from '../typechain'
import { ERC20 } from '../typechain'
import { sendTxn } from '../utils/helper'

task('add:liquidity', 'Add Liquidity')
  .addParam('token', 'token name')
  .addParam('amount', 'amount')
  .setAction(async function ({ token, amount }, { network, ethers: { getNamedSigner, getContract, getContractAt } }) {
    const tokens = require('../config/tokens.json')[network.name]
    const deployer = await getNamedSigner('deployer')

    const alpManager = (await getContract('AlpManager', deployer)) as AlpManager
    console.log('alpManager address', alpManager.address)
    const rewardRouterV2 = (await getContract('RewardRouterV2', deployer)) as RewardRouterV2
    console.log('rewardRouterV2 address', rewardRouterV2.address)
    const tokenAddress = tokens[token].address
    const tokenInstance = (await getContractAt('TestERC20', tokenAddress, deployer)) as ERC20

    const decimals = await tokenInstance.decimals()
    const balance = await tokenInstance.balanceOf(deployer.address)
    console.log('balance', formatUnits(balance, decimals))

    await sendTxn(tokenInstance.approve(alpManager.address, parseUnits(amount, decimals)), 'approve')
    // await sendTxn(alpManager.addLiquidity(tokenAddress, parseUnits(amount, decimals), 0, 0), 'alpManager.addLiquidity')
    await sendTxn(
      rewardRouterV2.mintAndStakeAlp(tokenAddress, parseUnits(amount, decimals), 0, 0),
      'alpManager.addLiquidity',
    )
    const stakedAlpTracker = (await getContract('StakedAlpTracker', deployer)) as RewardTracker
    console.log('stakedAlpTracker balance', (await stakedAlpTracker.balanceOf(deployer.address)).toString())

    console.log('addLiquidity successfully!')
  })
