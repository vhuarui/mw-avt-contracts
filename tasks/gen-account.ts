import { parseEther, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { randomHex } from '../utils/encoding'
import { delay } from './utils'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('gen-account', 'Gen Account', async (_, { ethers }) => {
  const deployer = await ethers.getNamedSigner('deployer')
  console.log('deployer.address', deployer.address)
  const provider = ethers.provider
  let privateKey
  let newAccount
  privateKey = randomHex(32)
  newAccount = new ethers.Wallet(privateKey, provider)
  console.log('privateKey', privateKey)
  console.log('Account', newAccount.address)
})
