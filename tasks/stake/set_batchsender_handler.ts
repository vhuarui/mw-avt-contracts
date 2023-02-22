import { task } from 'hardhat/config'
import { BatchSender } from '../../typechain'
import { sendTxn } from '../../utils/helper'

task('batchsender:handler', 'batchsender set handler')
  .addParam('handler', 'handler address')
  .setAction(async function ({ handler }, { ethers: { getNamedSigner, getContract } }) {
    const deployer = await getNamedSigner('deployer')
    console.log('deployer', deployer.address)
    console.log('handler', handler)

    const batchSender = (await getContract('BatchSender', deployer)) as BatchSender

    await sendTxn(await batchSender.setHandler(handler, true), 'batchSender.setHandler')
  })
