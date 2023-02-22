import { task } from 'hardhat/config'
import { Timelock, Vault } from '../../typechain'
import { sendTxn } from '../../utils/helper'

task('withdraw:fees', 'withdraw fees').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')
  console.log('deployer', deployer.address)

  const tokens = require('../../config/tokens.json')[network.name]
  const { btc, eth, link, usdc, usdt, dai } = tokens
  const tokenArr = [btc, eth, link, usdc, usdt, dai]
  const timeLock = (await getContract('Timelock', deployer)) as Timelock
  const vault = (await getContract('Vault', deployer)) as Vault

  await sendTxn(
    await timeLock.batchWithdrawFees(
      vault.address,
      tokenArr.map((t) => t.address),
    ),
    'timeLock.batchWithdrawFees',
  )
})
