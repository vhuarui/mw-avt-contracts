import { task } from 'hardhat/config'

task('contracts-address', 'Show contracts address').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const showAddress = async (contractName: string) => {
    if (contractName) {
      console.log(`${contractName}: "${(await getContract(contractName)).address}",`)
    } else {
      console.log('')
    }
  }

  const contractNameArr = [
    'Vault',
    'Router',
    'VaultReader',
    'Reader',
    'AlpManager',
    'RewardRouterV2',
    'RewardReader',
    'ALP',
    'AVT',
    'USDG',
    '',
    'StakedAvtTracker',
    'FeeAvtTracker',
    'StakedAlpTracker',
    'StakedAlpTracker2',
    'FeeAlpTracker',
    '',
    'StakedAvtDistributor',
    'StakedAlpDistributor',
    'StakedAlpDistributor2',
    '',
    'OrderBook',
    'OrderBookReader',
    '',
    'PositionRouter',
    'PositionManager',
    '',
    'ReferralStorage',
    'ReferralReader',
    '',
    'FastPriceFeed',
    'FastPriceEvents',
    'BatchSender',
    'Timelock',
    'FeeAvtTracker',
    'FeeAvtDistributor',
    'FeeAlpTracker',
    'FeeAlpDistributor',
  ]

  for await (const contractName of contractNameArr) {
    await showAddress(contractName)
  }
})
