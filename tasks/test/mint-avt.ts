import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { AVT, RewardDistributor } from '../../typechain'
import { expandDecimals, sendTxn } from '../../utils/helper'

task('mint:avt', 'mint avt').setAction(async function (
  _,
  { getNamedAccounts, ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const { daoFund, ecosystem, investor, earlyLP, community, coreTeam } = await getNamedAccounts()

  const avt = (await getContract('AVT', deployer)) as AVT
  const isAvtMinter = await avt.isMinter(deployer.address)
  if (!isAvtMinter) {
    await sendTxn(await avt.setMinter(deployer.address, true), 'avt.setMinter')
  }

  const daoFundMintAmount = parseUnits('2500000')
  const ecosystemMintAmount = parseUnits('3000000')
  const investorMintAmount = parseUnits('1500000')
  const earlyLPMintAmount = parseUnits('1000000')
  const communityMintAmount = parseUnits('1000000')
  const coreTeamMintAmount = parseUnits('1000000')

  const mintAvt = async (address: any, amounts: any, label: any) => {
    await sendTxn(await avt.mint(address, amounts), `mint ${formatUnits(amounts)} avt to ${label}`)
    console.log(label, 'avt balance', formatUnits(await avt.balanceOf(address)))
  }

  await mintAvt(daoFund, daoFundMintAmount, 'daoFund')
  await mintAvt(ecosystem, ecosystemMintAmount, 'ecosystem')
  await mintAvt(investor, investorMintAmount, 'investor')
  await mintAvt(earlyLP, earlyLPMintAmount, 'earlyLP')
  await mintAvt(community, communityMintAmount, 'community')
  await mintAvt(coreTeam, coreTeamMintAmount, 'coreTeam')

  console.log('AVT totalSupply', formatUnits(await avt.totalSupply()))
})
