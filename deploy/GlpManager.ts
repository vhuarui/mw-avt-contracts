import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({ deployments, network, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running AlpManager deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name]

  const vault = await ethers.getContract('Vault')
  const usdg = await ethers.getContract('USDG')
  const alp = await ethers.getContract('ALP')

  const cooldownDuration = contractConfig.alpManager.cooldownDuration

  const { address } = await deploy('AlpManager', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, usdg.address, alp.address, cooldownDuration],
  })

  console.log('AlpManager deployed at ', address)

  const alpManager = await ethers.getContract('AlpManager')

  // await sendTxn(alpManager.setInPrivateMode(true), 'alpManager.setInPrivateMode')
  await sendTxn(alp.setMinter(alpManager.address, true), 'alp.setMinter')
  await sendTxn(usdg.addVault(alpManager.address), 'usdg.addVault(alpManager)')

  await sendTxn(vault.setInManagerMode(true), 'vault.setInManagerMode')
  await sendTxn(vault.setManager(alpManager.address, true), 'vault.setManager')
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'USDG', 'ALP']

deployFunction.tags = ['AlpManager']
