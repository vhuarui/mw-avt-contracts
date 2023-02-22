import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { task } from 'hardhat/config'

task('uni-v3:deploy', 'Deploy Uniswap V3 Core').setAction(async function (
  _,
  { deployments, getNamedAccounts, ethers: { getContract } },
) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  console.log('Deployer:', deployer)

  await deploy('UniV3Factory', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    contract: {
      bytecode: FACTORY_BYTECODE,
      abi: FACTORY_ABI,
    },
  })

  const factory = await getContract('UniV3Factory')
  console.log('UniV3Factory deployed at ', factory.address)
})
