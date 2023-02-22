import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'

task('test:weth:deploy', 'Deploy Test WETH')
  .addParam('supply', 'initial supply')
  .setAction(async function ({ supply }, { deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    // console.log('Deployer:', deployer)

    const { address } = await deploy('WETH9', {
      from: deployer,
      log: true,
      deterministicDeployment: false,
      skipIfAlreadyDeployed: false,
      // waitConfirmations: 3,
      args: [parseUnits(supply)],
    })

    console.log('WETH deployed at ', address)
  })
