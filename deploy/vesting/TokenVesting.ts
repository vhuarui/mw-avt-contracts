import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { AVT } from '../../typechain'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running TokenVesting1 deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const avt = (await ethers.getContract('AVT')) as AVT

  const { address } = await deploy('TokenVesting1', {
    contract: 'TokenVesting',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [avt.address],
  })

  console.log('TokenVesting1 deployed at ', address)
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Vesting', 'TokenVesting1']
