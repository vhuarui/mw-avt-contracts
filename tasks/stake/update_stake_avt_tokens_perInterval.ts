import { task } from 'hardhat/config'
import { RewardDistributor } from '../../typechain'
import { expandDecimals, updateTokensPerInterval } from '../../utils/helper'
import { formatUnits } from 'ethers/lib/utils'

task('update:avt-stake-rewards', 'update avt stake rewards').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const stakedAvtDistributor = (await getContract('StakedAvtDistributor', deployer)) as RewardDistributor

  const shouldSendTxn = true
  const monthlyAvtForAvt = expandDecimals(200_000, 18)
  const secondsPerMonth = 30 * 24 * 60 * 60
  const avtNextTokensPerInterval = monthlyAvtForAvt.div(secondsPerMonth)

  if (shouldSendTxn) {
    await updateTokensPerInterval(stakedAvtDistributor, avtNextTokensPerInterval, 'alpRewardDistributor')
  }
  console.log('avt stake new TokensPerInterval', formatUnits(await stakedAvtDistributor.tokensPerInterval()))
})
