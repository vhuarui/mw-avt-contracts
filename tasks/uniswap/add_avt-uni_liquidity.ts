import { abi as FACTORY_ABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { abi as POOL_ABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { parseUnits } from 'ethers/lib/utils'
import { Pool } from '@uniswap/v3-sdk'
import { Token as UniToken } from '@uniswap/sdk-core'

import { contractConfigs } from '../../config/contractConfigs'
import { task } from 'hardhat/config'
import { AVT, IUniswapV3Factory, IUniswapV3Pool, WETH9 } from '../../typechain'
import { BigNumber, constants } from 'ethers'
import { sendTxn } from '../../utils/helper'

task('add:avt-uni-liquidity', 'add avt liquidity to uniV3').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const tokens = require('../../config/tokens.json')[network.name]
  const contracts = contractConfigs[network.name]

  const { nativeToken } = tokens
  const factory = (await getContractAt(FACTORY_ABI, contracts.uniswap.factory, deployer)) as IUniswapV3Factory
  const WETH = (await getContractAt('WETH9', nativeToken.address, deployer)) as WETH9
  const avt = (await getContract('AVT', deployer)) as AVT
  // const avt = (await getContractAt('AVT', '0x3123D2Ab5dDE11F75Bff9aA7f6dc4f68b7bc74eF', deployer)) as AVT

  console.log('AVT', avt.address)
  console.log('WETH', WETH.address)
  console.log('factory', factory.address)

  let poolAddress = await factory.getPool(avt.address, WETH.address, parseUnits('0.3', 4))
  console.log('poolAddress', poolAddress)

  if (poolAddress == constants.AddressZero) {
    await sendTxn(await factory.createPool(avt.address, WETH.address, parseUnits('0.3', 4)), 'factory.createPool')
    poolAddress = await factory.getPool(avt.address, WETH.address, parseUnits('0.3', 4))
    console.log('created poolAddress', poolAddress)
  }

  const pool = (await getContractAt(POOL_ABI, poolAddress, deployer)) as IUniswapV3Pool

  let priceSqrt
  if (avt.address < WETH.address) {
    priceSqrt = BigNumber.from(1).mul(BigNumber.from(2).pow(96)).div(Math.sqrt(1245).toFixed(0))
    console.log('priceSqrt', priceSqrt)
  } else {
    priceSqrt = BigNumber.from(Math.sqrt(1245).toFixed(0)).mul(BigNumber.from(2).pow(96))
    console.log('priceSqrt', priceSqrt)
  }

  let uniPoolSlot0 = await pool.slot0()
  if (BigNumber.from(0).eq(uniPoolSlot0.sqrtPriceX96)) {
    await sendTxn(await pool.initialize(priceSqrt), 'pool.initialize')
  }
  uniPoolSlot0 = await pool.slot0()

  const tokenA = new UniToken(0, WETH.address, 18, 'SYMBOL', 'NAME')
  const tokenB = new UniToken(0, avt.address, 18, 'SYMBOL', 'NAME')
  console.log('uniPoolSlot0.sqrtPriceX96', uniPoolSlot0.sqrtPriceX96.toString())
  const sdkPool = new Pool(
    tokenA, // tokenA
    tokenB, // tokenB
    10000, // fee
    uniPoolSlot0.sqrtPriceX96.toString(), // sqrtRatioX96
    1, // liquidity
    uniPoolSlot0.tick, // tickCurrent
    [],
  )
  const poolTokenPriceA = sdkPool.priceOf(tokenA).toSignificant(6)
  const poolTokenPriceB = sdkPool.priceOf(tokenB).toSignificant(6)
  console.log('poolTokenPrice WETH', poolTokenPriceA)
  console.log('poolTokenPrice AVT', poolTokenPriceB)
})
