import { task } from 'hardhat/config'
import { Vault } from '../../typechain'
import { formatUnits } from 'ethers/lib/utils'

task('get:fees', 'get fees').setAction(async function (_, { network, ethers: { getNamedSigner, getContract } }) {
  const deployer = await getNamedSigner('deployer')
  console.log('deployer', deployer.address)

  const tokens = require('../../config/tokens.json')[network.name]
  const { btc, eth, link, usdc, usdt, dai } = tokens
  const tokenArr = [btc, eth, link, usdc, usdt, dai]
  const vault = (await getContract('Vault', deployer)) as Vault

  for await (const token of tokenArr) {
    const fee = await vault.feeReserves(token.address)
    console.log(token.name, 'fee', formatUnits(fee, token.decimals))
  }
})
