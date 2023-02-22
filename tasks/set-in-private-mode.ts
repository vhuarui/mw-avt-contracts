import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { AlpManager } from '../typechain'
import { sendTxn } from '../utils/helper'

task('alp_manager:private_mode:off', 'alp_manager:private_mode:off').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const alpManager = (await getContract('AlpManager', deployer)) as AlpManager
  await sendTxn(alpManager.setInPrivateMode(false), 'alpManager.setInPrivateMode(false)')
  console.log('addLiquidity successfully!')
})
