import { parseUnits } from 'ethers/lib/utils'
import { expandDecimals, toUsd } from '../utils/helper'

export const contractConfigs: { [networkName: string]: any } = {
  dev_optest: {
    vault: {
      fundingInterval: 60 * 60,
      fundingRateFactor: 100,
      stableFundingRateFactor: 100,
      mintBurnFeeBasisPoints: 25,
      swapFeeBasisPoints: 30,
      stableSwapFeeBasisPoints: 5,
      taxBasisPoints: 50,
      stableTaxBasisPoints: 5,
      marginFeeBasisPoints: 10,
      liquidationFeeUsd: toUsd(5),
      minProfitTime: 3 * 60 * 60,
      hasDynamicFees: true,
    },
    orderBook: {
      minExecutionFee: parseUnits('0.0003', 18),
      minPurchaseTokenAmountUsd: expandDecimals(10, 30),
    },
    fastPriceFeed: {
      priceDataInterval: 5 * 60,
      spreadBasisPointsIfInactive: 50,
      spreadBasisPointsIfChainError: 500,
      priceDuration: 5 * 60,
      maxPriceUpdateDelay: 60 * 60,
      maxDeviationBasisPoints: 750,
      minBlockInterval: 0,
      maxTimeDeviation: 60 * 60,
      minAuthorizations: 1,
      signer: ['0x3f239277fea18b100d6aa2efA8fEDD6893bEb543', '0xb1e5eE887220f042148FAA3B5820E8A0A5d56f73'],
      updater: ['0x23814ddeF86A3060D3532F7b28052A7dC85c0f07'],
      keeper: ['0x0fb57058404855407EF79f6ae6C50a37A21E8dD5'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0x0F5a2334A12875665EFdE81decb07b85C37781c0',
      liquidator: '0xa76613490a911a5515eAFa64b129D975AbfAfEA3',
    },
    positionRouter: {
      depositFee: 30,
      minExecutionFee: parseUnits('0.0001', 18),
      minBlockDelayKeeper: 1,
      minTimeDelayPublic: 180,
      maxTimeDelay: 30 * 60,
    },
    alpManager: {
      cooldownDuration: 15 * 60,
    },
    tokenManager: {
      minAuthorizations: 1,
    },
    vaultTimeLock: {
      buffer: 24 * 60 * 60,
      maxTokenSupply: 0,
      maxMarginFeeBasisPoints: 500,
    },
    priceFeedTimelock: {
      buffer: 24 * 60 * 60,
    },
    uniswap: {
      factory: '0xF43477707CB888fE7B2c0fb265e756bb8dBa25F7',
    },
  },
  private_optest: {
    vault: {
      fundingInterval: 60 * 60,
      fundingRateFactor: 100,
      stableFundingRateFactor: 100,
      mintBurnFeeBasisPoints: 25,
      swapFeeBasisPoints: 30,
      stableSwapFeeBasisPoints: 5,
      taxBasisPoints: 50,
      stableTaxBasisPoints: 5,
      marginFeeBasisPoints: 10,
      liquidationFeeUsd: toUsd(5),
      minProfitTime: 3 * 60 * 60,
      hasDynamicFees: true,
    },
    orderBook: {
      minExecutionFee: parseUnits('0.0003', 18),
      minPurchaseTokenAmountUsd: expandDecimals(10, 30),
    },
    fastPriceFeed: {
      priceDataInterval: 5 * 60,
      spreadBasisPointsIfInactive: 50,
      spreadBasisPointsIfChainError: 500,
      priceDuration: 5 * 60,
      maxPriceUpdateDelay: 60 * 60,
      maxDeviationBasisPoints: 750,
      minBlockInterval: 0,
      maxTimeDeviation: 60 * 60,
      minAuthorizations: 1,
      signer: ['0xa8f6E4f346cB7Cb80Ec5E03e0c4CCB849f2d0956', '0xa439195c135730F23F1BAB3e5696EA13D06bEC61'],
      updater: ['0xa4424848AaD995b096Bd21704cb3b1C1BCd51147'],
      keeper: ['0xca7872e4761C012c5091a8c3d39654e840F2E83d'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0x7ccE18928a843B4c94F7290a5597f6381D7C7653',
      liquidator: '0xA5cC10945dac786c4E8eb2b26ABA0688830b0ea9',
    },
    positionRouter: {
      depositFee: 30,
      minExecutionFee: parseUnits('0.0001', 18),
      minBlockDelayKeeper: 1,
      minTimeDelayPublic: 180,
      maxTimeDelay: 30 * 60,
    },
    alpManager: {
      cooldownDuration: 15 * 60,
    },
    tokenManager: {
      minAuthorizations: 1,
    },
    vaultTimeLock: {
      buffer: 24 * 60 * 60,
      maxTokenSupply: 0,
      maxMarginFeeBasisPoints: 500,
    },
    priceFeedTimelock: {
      buffer: 24 * 60 * 60,
    },
    uniswap: {
      factory: '0xF43477707CB888fE7B2c0fb265e756bb8dBa25F7',
    },
  },
  localhost: {
    vault: {
      fundingInterval: 60 * 60,
      fundingRateFactor: 100,
      stableFundingRateFactor: 100,
      mintBurnFeeBasisPoints: 25,
      swapFeeBasisPoints: 30,
      stableSwapFeeBasisPoints: 1,
      taxBasisPoints: 50,
      stableTaxBasisPoints: 5,
      marginFeeBasisPoints: 10,
      liquidationFeeUsd: toUsd(5),
      minProfitTime: 3 * 60 * 60,
      hasDynamicFees: true,
    },
    orderBook: {
      minExecutionFee: parseUnits('0.0003', 18),
      minPurchaseTokenAmountUsd: expandDecimals(10, 30),
    },
    fastPriceFeed: {
      priceDataInterval: 5 * 60,
      spreadBasisPointsIfInactive: 50,
      spreadBasisPointsIfChainError: 500,
      priceDuration: 5 * 60,
      maxPriceUpdateDelay: 60 * 60,
      maxDeviationBasisPoints: 750,
      minBlockInterval: 0,
      maxTimeDeviation: 60 * 60,
      minAuthorizations: 1,
      signer: ['0xa8f6E4f346cB7Cb80Ec5E03e0c4CCB849f2d0956', '0xa439195c135730F23F1BAB3e5696EA13D06bEC61'],
      updater: ['0xa4424848AaD995b096Bd21704cb3b1C1BCd51147'],
      keeper: ['0xca7872e4761C012c5091a8c3d39654e840F2E83d'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0x7ccE18928a843B4c94F7290a5597f6381D7C7653',
      liquidator: '0xA5cC10945dac786c4E8eb2b26ABA0688830b0ea9',
    },
    positionRouter: {
      depositFee: 30,
      minExecutionFee: parseUnits('0.0001', 18),
      minBlockDelayKeeper: 1,
      minTimeDelayPublic: 180,
      maxTimeDelay: 30 * 60,
    },
    alpManager: {
      cooldownDuration: 15 * 60,
    },
    tokenManager: {
      minAuthorizations: 1,
    },
    vaultTimeLock: {
      buffer: 24 * 60 * 60,
      maxTokenSupply: 0,
      maxMarginFeeBasisPoints: 500,
    },
    priceFeedTimelock: {
      buffer: 24 * 60 * 60,
    },
    uniswap: {
      factory: '0xF43477707CB888fE7B2c0fb265e756bb8dBa25F7',
    },
  },
}
