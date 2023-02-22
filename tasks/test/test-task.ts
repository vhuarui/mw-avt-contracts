import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import {
  TestERC20,
  AlpManager,
  PositionRouter,
  Router,
  Vault,
  FastPriceFeed,
  Reader,
  PositionManager,
  AVT,
  Timelock,
} from '../../typechain'
import { getPriceBits, sendTxn, toUsd } from '../../utils/helper'

import axios from 'axios'
import { time } from '@nomicfoundation/hardhat-network-helpers'

task('test:task', 'Test Task').setAction(async function (
  _,
  { network, ethers: { provider, getNamedSigner, getContract, getContractAt } },
) {
  const tokens = require('../../config/tokens.json')[network.name]
  const { btc, eth, link, usdc, usdt, dai } = tokens
  const tokenArr = [btc, eth, link, usdc, usdt, dai]
  const fastPriceTokens = [btc, eth, link]
  const tokenAddressArr = tokenArr.map((t) => t.address)
  const deployer = await getNamedSigner('deployer')
  const admin = await getNamedSigner('admin')

  async function getBlockTime() {
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)
    return block.timestamp
  }

  const showAddress = async (contractName: string) => {
    console.log(contractName, '->', (await getContract(contractName)).address)
  }
  // const reader = (await getContract('Reader', deployer)) as Reader
  // const res = await reader.getTokenBalances(deployer.address, ['0x830d3f083e51d4475353Eea3e725CfA993C030b8'])
  // console.log(res);
  // console.log('parseUnits', parseUnits('1.22', 30).toString())

  const vault = (await getContract('Vault', deployer)) as Vault
  const positionRouter = (await getContract('PositionRouter', deployer)) as PositionRouter
  const positionManager = (await getContract('PositionManager', deployer)) as PositionManager
  const router = (await getContract('Router', deployer)) as Router
  const reader = (await getContract('Reader', deployer)) as Reader
  const alpManager = (await getContract('AlpManager', deployer)) as AlpManager
  const fastPriceFeed = (await getContract('FastPriceFeed', deployer)) as FastPriceFeed
  const timelock = (await getContract('Timelock', deployer)) as Timelock
  const avt = (await getContract('AVT', deployer)) as AVT

  console.log('Reader', reader.address)
  console.log('positionRouter', positionRouter.address)
  console.log('positionManager', positionManager.address)
  console.log('router', router.address)
  console.log('avt', avt.address)
  console.log('timelock', timelock.address)

  console.log('aum', formatUnits(await alpManager.getAumInUsdg(true), 30))

  console.log('getMinPrice', (await vault.getMinPrice(tokens.btc.address)).toString())
  // console.log('', (await vault.getMaxPrice(tokens.btc.address)).toString())

  // console.log('MaxLeverage', (await vault.maxLeverage()).toString())
  // console.log('Price', (await fastPriceFeed.prices(tokens.ftm.address)).toString())

  // await sendTxn(await timelock.setMaxLeverage(vault.address, 1000000), 'setMaxLeverage')
  // console.log('New MaxLeverage', (await vault.maxLeverage()).toString())
  // Mint AVT
  // await avt.setMinter(deployer.address, true)
  // await avt.mint(deployer.address, parseUnits('100000'))

  /* const fundingRates = await reader.getFundingRates(vault.address, tokens.nativeToken.address, tokenAddressArr)
  console.log('fundingRates', fundingRates.toString())

  console.log('PositionRouter maxGlobalLongSizes', await positionRouter.maxGlobalLongSizes(btc.address))
  console.log('PositionRouter maxGlobalShortSizes', await positionRouter.maxGlobalShortSizes(btc.address))

  console.log('PositionManager maxGlobalLongSizes', await positionManager.maxGlobalLongSizes(btc.address))
  console.log('PositionManager maxGlobalShortSizes', await positionManager.maxGlobalShortSizes(btc.address)) */

  // await time.increase(15 * 60)

  // 铸造代币
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
  const to = ''
  // await sendTxn(await btcInstance.transfer(to, parseUnits('10000', await btcInstance.decimals())), `transfer 10000 btc to ${to}`)
  // await sendTxn(await ethInstance.transfer(to, parseUnits('100000', await ethInstance.decimals())), `transfer 100000 eth to ${to}`)
  // await sendTxn(await linkInstance.transfer(to, parseUnits('1000000', await linkInstance.decimals())), `transfer 1000000 link to ${to}`)
  // await sendTxn(await usdcInstance.transfer(to, parseUnits('1000000', await usdcInstance.decimals())), `transfer 1000000 usdc to ${to}`)
  // await sendTxn(await usdtInstance.transfer(to, parseUnits('1000000', await usdtInstance.decimals())), `transfer 1000000 usdt to ${to}`)
  // await sendTxn(await daiInstance.transfer(to, parseUnits('1000000', await daiInstance.decimals())), `transfer 1000000 dai to ${to}`)

  // console.log('eth balance', formatUnits(await ethInstance.balanceOf(to), await ethInstance.decimals()))

  // 取消授权
  /* await waitTx(await token.approve(router.address, 0))
  console.log('approvedPlugins positionManager', await router.approvedPlugins(deployer.address, positionManager.address))
  console.log('approvedPlugins positionRouter', await router.approvedPlugins(deployer.address, positionRouter.address))
  await sendTxn(router.denyPlugin(positionRouter.address), 'router.denyPlugin(positionRouter.address)')
  await sendTxn(router.denyPlugin(positionManager.address), 'router.denyPlugin(positionManager .address)')
  console.log('approvedPlugins positionManager', await router.approvedPlugins(deployer.address, positionManager.address))
  console.log('approvedPlugins positionRouter', await router.approvedPlugins(deployer.address, positionRouter.address)) */

  // const contractNameArr = [
  //   // 'WrappedFtm',
  //   'Vault',
  //   'Router',
  //   'VaultReader',
  //   'Reader',
  //   'AlpManager',
  //   'ALP',
  //   'USDG',
  //   'OrderBook',
  //   'OrderBookReader',
  //   'PositionRouter',
  //   'PositionManager',
  //   'ReferralStorage',

  //   'FastPriceFeed',
  //   'Timelock',
  // ]
  // // await Promise.all(contractNameArr.map((contractName) => showAddress(contractName)))
  // for await (const contractName of contractNameArr) {
  //   await showAddress(contractName)
  // }

  // console.log('tokens', await fastPriceFeed.tokens(0))

  // await sendTxn(
  //   fastPriceFeed.setTokens(
  //     fastPriceTokens.map((t) => t.address),
  //     fastPriceTokens.map((t) => t.fastPricePrecision),
  //   ),
  //   'secondaryPriceFeed.setTokens',
  // )

  // let setPrices: string | any[] = []
  // for await (const token of fastPriceTokens) {
  //   const price = await getBiAnPrice(token.name)
  //   setPrices.push(price * token.fastPricePrecision)
  // }
  // console.log('setPrices', setPrices)

  // const priceBits = getPriceBits(setPrices)
  // console.log(priceBits)
  // const timestamp = await getBlockTime()
  // const tx = await fastPriceFeed.setPricesWithBits(priceBits, timestamp)
  // await waitTx(tx)

  // const positionKey1 = await vault.getPositionKey(deployer.address, tokens.btc.address, tokens.btc.address, true)
  // console.log('getPositionKey', positionKey1)
  // const positionInfo1 = await vault.positions(positionKey1)
  // console.log('positionInfo', positionInfo1, positionInfo1.toString())
  // const positionKey = await vault.getPositionKey(deployer.address, tokens.usdc.address, tokens.btc.address, false)
  // console.log('getPositionKey', positionKey)
  // const positionInfo = await vault.positions(positionKey)
  // console.log('positionInfo', positionInfo, positionInfo.toString())
  // console.log('alpManager address', alpManager.address)

  // const token = (await getContractAt('TestERC20', tokens.btc.address, deployer)) as TestERC20

  // await sendTxn(positionRouter.setPositionKeeper(admin.address, true), 'positionRouter.setPositionKeeper')

  // const executionFee = await positionRouter.minExecutionFee()

  // const referralCode = '0x0000000000000000000000000000000000000000000000000000000000000000'

  // await sendTxn(router.approvePlugin(positionRouter.address), 'router.approvePlugin')
  // await sendTxn(token.approve(router.address, parseUnits('1', 18)), 'btc.approve ')
  // await sendTxn(
  //   positionRouter.createIncreasePosition(
  //     [token.address], // _path
  //     token.address, // _indexToken
  //     parseUnits('1', 18), // _amountIn
  //     parseUnits('0.1', 18), // _minOut
  //     toUsd(21000), // _sizeDelta
  //     true, // _isLong
  //     toUsd(30000), // _acceptablePrice
  //     executionFee,
  //     referralCode,
  //     {
  //       value: executionFee,
  //     },
  //   ),
  //   'createIncreasePosition long..',
  // )
})

async function getBiAnPrice(name: string) {
  const api = `https://api.binance.com/api/v3/ticker/price?symbols=["${name.toLocaleUpperCase()}USDT"]`
  let params = await axios.get(api)
  let data = params.data
  return data[0].price
}
