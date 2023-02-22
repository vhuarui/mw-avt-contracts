import { task } from 'hardhat/config'
import { Wallet } from 'ethers'

task('gen-accounts', 'Gen Accounts', async (_, { ethers }) => {
  const deployer = await ethers.getNamedSigner('deployer')
  console.log('deployer.address', deployer.address)

  const genWallet = (walletName: String) => {
    const wallet = Wallet.createRandom()
    console.log(walletName)
    console.log('privateKey', wallet.privateKey)
    console.log('Account', wallet.address)
  }

  genWallet('Deployer')
  genWallet('Updater')
  genWallet('Keeper')
  genWallet('OrderKeeper')
  genWallet('Liquidator')
  genWallet('Singer1')
  genWallet('Singer2')

  console.log('')
  genWallet('Faucet')
  genWallet('AirDrop')

  console.log('')
  genWallet('DaoFund')
  genWallet('Ecosystem')
  genWallet('Investor')
  genWallet('EarlyLP')
  genWallet('Community')
  genWallet('CoreTeam')
})
