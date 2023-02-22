import { task } from 'hardhat/config'
import { mine, time } from '@nomicfoundation/hardhat-network-helpers'

task('increase:time', 'update alp stake rewards')
  .addOptionalParam('s', 'Increase Seconds')
  .setAction(async function ({ s }, { ethers: { getNamedSigner, getContract } }) {
    await time.increase(Number(s))
    await mine(1)
  })
