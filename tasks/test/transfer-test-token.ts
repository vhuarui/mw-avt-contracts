import { task } from 'hardhat/config'
import { TestERC20 } from '../../typechain'
import { sendTxn } from '../../utils/helper'
import { parseUnits } from 'ethers/lib/utils'

task('transfer:test:tokens', 'transfer test tokens')
  .addParam('to', 'transfer to address')
  .setAction(async function ({ to }, { network, ethers: { getNamedSigner, getContractAt } }) {
    const deployer = await getNamedSigner('deployer')
    console.log('deployer', deployer.address)
    console.log('to', to)

    const tokens = require('../../config/tokens.json')[network.name]
    const { btc, eth, link, usdc, usdt, dai } = tokens
    const btcAddress = btc.address // BTC
    const ethAddress = eth.address // ETH
    const linkAddress = link.address // LINK
    const usdcAddress = usdc.address // USDC
    const usdtAddress = usdt.address // USDT
    const daiAddress = dai.address // DAI
    const btcInstance = (await getContractAt('TestERC20', btcAddress, deployer)) as TestERC20
    const ethInstance = (await getContractAt('TestERC20', ethAddress, deployer)) as TestERC20
    const linkInstance = (await getContractAt('TestERC20', linkAddress, deployer)) as TestERC20
    const usdcInstance = (await getContractAt('TestERC20', usdcAddress, deployer)) as TestERC20
    const usdtInstance = (await getContractAt('TestERC20', usdtAddress, deployer)) as TestERC20
    const daiInstance = (await getContractAt('TestERC20', daiAddress, deployer)) as TestERC20
    await sendTxn(
      await btcInstance.transfer(to, parseUnits('10000', await btcInstance.decimals())),
      `transfer 10000 btc to ${to}`,
    )
    await sendTxn(
      await ethInstance.transfer(to, parseUnits('100000', await ethInstance.decimals())),
      `transfer 100000 eth to ${to}`,
    )
    await sendTxn(
      await linkInstance.transfer(to, parseUnits('1000000', await linkInstance.decimals())),
      `transfer 1000000 link to ${to}`,
    )
    await sendTxn(
      await usdcInstance.transfer(to, parseUnits('1000000', await usdcInstance.decimals())),
      `transfer 1000000 usdc to ${to}`,
    )
    await sendTxn(
      await usdtInstance.transfer(to, parseUnits('1000000', await usdtInstance.decimals())),
      `transfer 1000000 usdt to ${to}`,
    )
    await sendTxn(
      await daiInstance.transfer(to, parseUnits('1000000', await daiInstance.decimals())),
      `transfer 1000000 dai to ${to}`,
    )
  })
