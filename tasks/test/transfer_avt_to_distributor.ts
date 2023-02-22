import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { AVT, RewardDistributor } from '../../typechain'
import { expandDecimals, sendTxn } from '../../utils/helper'

task('transfer:avt:distributor', 'update alp stake rewards').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const stakedAlpDistributor = (await getContract('StakedAlpDistributor', deployer)) as RewardDistributor
  const stakedAlpDistributor2 = (await getContract('StakedAlpDistributor2', deployer)) as RewardDistributor
  const stakedAvtDistributor = (await getContract('StakedAvtDistributor', deployer)) as RewardDistributor

  const avt = (await getContract('AVT', deployer)) as AVT

  console.log('before stakedAlpDistributor balance', formatUnits(await avt.balanceOf(stakedAlpDistributor.address)))
  console.log('before stakedAlpDistributor2 balance', formatUnits(await avt.balanceOf(stakedAlpDistributor2.address)))
  console.log('before stakedAvtDistributor balance', formatUnits(await avt.balanceOf(stakedAvtDistributor.address)))
  const mintAvtForAlp = expandDecimals(152632 + 126316 + 63158 + 37895, 18)
  const mintAvtForAlp2 = expandDecimals(160_000, 18)
  const mintAvtForAvt = expandDecimals(200_000, 18)

  await sendTxn(
    await avt.transfer(stakedAlpDistributor.address, mintAvtForAlp),
    `mint avt to stakedAlpDistributor ${stakedAlpDistributor.address}`,
  )
  await sendTxn(
    await avt.transfer(stakedAlpDistributor.address, mintAvtForAlp2),
    `mint avt to stakedAlpDistributor2 ${stakedAlpDistributor2.address}`,
  )
  await sendTxn(
    await avt.transfer(stakedAvtDistributor.address, mintAvtForAvt),
    `mint avt to stakedAvtDistributor ${stakedAvtDistributor.address}`,
  )

  console.log('new stakedAlpDistributor balance', formatUnits(await avt.balanceOf(stakedAlpDistributor.address)))
  console.log('new stakedAlpDistributor2 balance', formatUnits(await avt.balanceOf(stakedAlpDistributor2.address)))
  console.log('new stakedAvtDistributor balance', formatUnits(await avt.balanceOf(stakedAvtDistributor.address)))
})
