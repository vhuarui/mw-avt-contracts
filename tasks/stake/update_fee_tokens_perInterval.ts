import { task } from 'hardhat/config'
import { RewardDistributor, WETH9 } from '../../typechain'
import { expandDecimals, sendTxn, updateTokensPerInterval } from '../../utils/helper'
import { formatUnits } from 'ethers/lib/utils'

task('update:fee-rewards', 'update avt stake rewards').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')
  const tokens = require('../../config/tokens.json')[network.name]
  const { eth } = tokens

  const feeAvtDistributor = (await getContract('FeeAvtDistributor', deployer)) as RewardDistributor
  const feeAlpDistributor = (await getContract('FeeAlpDistributor', deployer)) as RewardDistributor

  const shouldSendTxn = true
  const secondsPerWeek = 7 * 24 * 60 * 60
  const weeklyETHForAvt = expandDecimals(20, 18)
  const weeklyETHForAlp = expandDecimals(80, 18)

  const feeAvtNextTokensPerInterval = weeklyETHForAvt.div(secondsPerWeek)
  const feeAlpNextTokensPerInterval = weeklyETHForAlp.div(secondsPerWeek)

  console.log('AVT fee TokensPerInterval Set', formatUnits(feeAvtNextTokensPerInterval))
  console.log('ALP fee TokensPerInterval Set', formatUnits(feeAlpNextTokensPerInterval))

  if (shouldSendTxn) {
    await updateTokensPerInterval(feeAvtDistributor, feeAvtNextTokensPerInterval, 'feeAvtDistributor')
    await updateTokensPerInterval(feeAlpDistributor, feeAlpNextTokensPerInterval, 'feeAlpDistributor')
  }
  console.log('AVT fee new TokensPerInterval', formatUnits(await feeAvtDistributor.tokensPerInterval()))
  console.log('ALP fee new TokensPerInterval', formatUnits(await feeAlpDistributor.tokensPerInterval()))

  const weth = (await getContractAt('WETH9', eth.address)) as WETH9
  await sendTxn(weth.transfer(feeAvtDistributor.address, weeklyETHForAvt), `weth transfer to feeAvtDistributor`)
  await sendTxn(weth.transfer(feeAvtDistributor.address, weeklyETHForAlp), `weth transfer to feeAvtDistributor`)
})
