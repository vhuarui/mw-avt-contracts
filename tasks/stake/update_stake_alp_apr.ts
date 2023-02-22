import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { StakedAlpRewardDistributor, StakedAlpRewardDistributor2 } from '../../typechain'
import { expandDecimals, sendTxn } from '../../utils/helper'

task('update:alp-stake-rewards', 'update alp stake tokensPerIntervals').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const stakedAlpDistributor = (await getContract('StakedAlpDistributor', deployer)) as StakedAlpRewardDistributor
  const stakedAlpDistributor2 = (await getContract('StakedAlpDistributor2', deployer)) as StakedAlpRewardDistributor2

  const monthlyAvtForStakeAlp = expandDecimals(160_000, 18)

  const days90 = 90 * 24 * 60 * 60
  const tokensPerInterval1 = expandDecimals(252632, 18).div(days90)
  const tokensPerInterval2 = expandDecimals(252632 + 126316, 18).div(days90)
  const tokensPerInterval3 = expandDecimals(252632 + 126316 + 63158, 18).div(days90)
  const tokensPerInterval4 = expandDecimals(252632 + 126316 + 63158 + 37894, 18).div(days90)

  console.log('tokensPerInterval1', formatUnits(tokensPerInterval1))
  console.log('tokensPerInterval2', formatUnits(tokensPerInterval2))
  console.log('tokensPerInterval3', formatUnits(tokensPerInterval3))
  console.log('tokensPerInterval4', formatUnits(tokensPerInterval4))

  const secondsPerMonth = 30 * 24 * 60 * 60
  const nextMaxTokensPerInterval = monthlyAvtForStakeAlp.div(secondsPerMonth)
  console.log('nextMaxTokensPerInterval', formatUnits(nextMaxTokensPerInterval))

  const prevTokensPerInterval = await stakedAlpDistributor.tokensPerInterval()
  if (prevTokensPerInterval.eq(0)) {
    await sendTxn(
      stakedAlpDistributor.updateLastDistributionTime({ gasLimit: 900000 }),
      `stakedAlpDistributor.updateLastDistributionTime`,
    )
  }

  await sendTxn(
    await stakedAlpDistributor.setTokensPerIntervals(
      tokensPerInterval1,
      tokensPerInterval2,
      tokensPerInterval3,
      tokensPerInterval4,
      { gasLimit: 900000 },
    ),
    'stakedAlpDistributor.setTokensPerIntervals',
  )

  const prevTokensPerInterval2 = await stakedAlpDistributor2.tokensPerInterval()
  if (prevTokensPerInterval2.eq(0)) {
    await sendTxn(
      stakedAlpDistributor2.updateLastDistributionTime({ gasLimit: 900000 }),
      `stakedAlpDistributor2.updateLastDistributionTime`,
    )
  }
  await sendTxn(
    await stakedAlpDistributor2.setMaxTokensPerInterval(nextMaxTokensPerInterval),
    'stakedAlpDistributor2.setMaxTokensPerInterval',
  )

  console.log(
    'stakedAlpDistributor new tokensPerInterval1',
    formatUnits(await stakedAlpDistributor.tokensPerInterval1()),
  )
  console.log(
    'stakedAlpDistributor new tokensPerInterval2',
    formatUnits(await stakedAlpDistributor.tokensPerInterval2()),
  )
  console.log(
    'stakedAlpDistributor new tokensPerInterval3',
    formatUnits(await stakedAlpDistributor.tokensPerInterval3()),
  )
  console.log(
    'stakedAlpDistributor new tokensPerInterval4',
    formatUnits(await stakedAlpDistributor.tokensPerInterval4()),
  )
  console.log(
    'stakedAlpDistributor2 new maxTokensPerInterval',
    formatUnits(await stakedAlpDistributor2.maxTokensPerInterval()),
  )
})
