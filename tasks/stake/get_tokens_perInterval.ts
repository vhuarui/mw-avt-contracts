import { formatUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { RewardDistributor, StakedAlpRewardDistributor, StakedAlpRewardDistributor2 } from '../../typechain'

task('get:token-per-interval', 'get rewards config').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const stakedAlpDistributor = (await getContract('StakedAlpDistributor', deployer)) as StakedAlpRewardDistributor
  const stakedAlpDistributor2 = (await getContract('StakedAlpDistributor2', deployer)) as StakedAlpRewardDistributor2
  const stakedAvtDistributor = (await getContract('StakedAvtDistributor', deployer)) as RewardDistributor

  const feeAlpDistributor = (await getContract('FeeAlpDistributor', deployer)) as RewardDistributor
  const feeAvtDistributor = (await getContract('FeeAvtDistributor', deployer)) as RewardDistributor

  const distributorArr = [
    { name: 'stakedAvtDistributor', distributor: stakedAvtDistributor },
    { name: 'stakedAlpDistributor', distributor: stakedAlpDistributor },
    { name: 'stakedAlpDistributor2', distributor: stakedAlpDistributor2 },
    { name: 'feeAlpDistributor', distributor: feeAlpDistributor },
    { name: 'feeAvtDistributor', distributor: feeAvtDistributor },
  ]

  for await (const distributor of distributorArr) {
    console.log(distributor.name)

    const tokensPerInterval = await distributor.distributor.tokensPerInterval()
    console.log('tokensPerInterval', tokensPerInterval.toString())

    const secondsPerWeek = 7 * 24 * 60 * 60
    const secondsPerMonth = 30 * 24 * 60 * 60
    const weeklyReward = formatUnits(tokensPerInterval.mul(secondsPerWeek))
    const monthlyReward = formatUnits(tokensPerInterval.mul(secondsPerMonth))
    console.log('weeklyReward', weeklyReward)
    console.log('monthlyReward', monthlyReward)
    console.log('------------------------------------------------------------------')
  }

  const secondsPer90days = 90 * 24 * 60 * 60
  const tokensPerInterval1 = await stakedAlpDistributor.tokensPerInterval1()
  const tokensPerInterval2 = await stakedAlpDistributor.tokensPerInterval2()
  const tokensPerInterval3 = await stakedAlpDistributor.tokensPerInterval3()
  const tokensPerInterval4 = await stakedAlpDistributor.tokensPerInterval4()
  console.log(
    'stakedAlpDistributor tokensPerInterval1',
    formatUnits(tokensPerInterval1),
    `(${formatUnits(tokensPerInterval1.mul(secondsPer90days))}) / 90days`,
  )
  console.log(
    'stakedAlpDistributor tokensPerInterval2',
    formatUnits(tokensPerInterval2),
    `(${formatUnits(tokensPerInterval2.mul(secondsPer90days))}) / 90days`,
  )
  console.log(
    'stakedAlpDistributor tokensPerInterval3',
    formatUnits(tokensPerInterval3),
    `(${formatUnits(tokensPerInterval3.mul(secondsPer90days))}) / 90days`,
  )
  console.log(
    'stakedAlpDistributor tokensPerInterval4',
    formatUnits(tokensPerInterval4),
    `(${formatUnits(tokensPerInterval4.mul(secondsPer90days))}) / 90days`,
  )
  const secondsPerMonth = 30 * 24 * 60 * 60
  const maxTokensPerInterval = await stakedAlpDistributor2.maxTokensPerInterval()
  console.log(
    'stakedAlpDistributor2 maxTokensPerInterval',
    formatUnits(maxTokensPerInterval),
    `(${formatUnits(maxTokensPerInterval.mul(secondsPerMonth))}) / 30days`,
  )
})
