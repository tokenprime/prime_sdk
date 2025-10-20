/**
 * ENR1M SDK - TypeScript SDK for ENR1M Power Plant Tokenization Platform
 * 
 * A modern, type-safe SDK built with Viem for interacting with ENR1M smart contracts.
 * Supports the complete workflow of power plant tokenization, profit distribution,
 * and user interactions.
 * 
 * @author ENR1M Team
 * @version 1.0.0
 */

import { createPublicClient, http } from 'viem'
import type { Address, Hash, PublicClient, WalletClient } from 'viem'

// Main client
export { default as ENR1MClient } from './client/ENR1MClient'

// Contract ABIs
export {
  ENR1M_TOKEN_ABI,
  DISTRIBUTOR_ABI,
  REVENUE_VAULT_ABI,
  TOKEN_SALE_ABI,
  MOCK_USDC_ABI
} from './contracts/abis'

// Types
export type {
  ContractAddresses,
  ContractConfig,
  DistributionInfo,
  UserInfo,
  SnapshotResult,
  DistributionResult,
  ClaimResult,
  SystemStatus,
  MonthlyOperationParams,
  TokenPurchase,
  ContractEvents,
  ChainConfig,
  SupportedChainId,
  
  // ABI types
  ENR1MTokenABI as ENR1MTokenABIType,
  DistributorABI as DistributorABIType,
  RevenueVaultABI as RevenueVaultABIType,
  TokenSaleABI as TokenSaleABIType,
  MockUSDCABI as MockUSDCABIType
} from './types/contracts'

// Error classes
export {
  ENR1MSDKError,
  ContractInteractionError,
  InsufficientBalanceError,
  InvalidSnapshotError,
  ClaimDeadlinePassedError
} from './types/contracts'

// Constants and supported chains
export {
  SUPPORTED_CHAINS
} from './types/contracts'

// Utility functions
export {
  getChainConfig,
  getViemChain,
  getRoleHash,
  getRecordDate,
  getDistributionDate,
  getClaimDeadline,
  isClaimDeadlinePassed,
  formatTokenDisplay,
  formatUSDCDisplay,
  formatPercentage,
  calculateUserShare,
  calculateAPY,
  isValidAddress,
  isValidHash,
  validateSnapshotId,
  validateAmount,
  parseContractError,
  CONSTANTS,
  ROLES,
  CHAIN_CONFIGS
} from './utils/helpers'

// Import types and utilities for factory function
import type { 
  SupportedChainId, 
  ContractAddresses 
} from './types/contracts'
import { 
  getChainConfig, 
  getViemChain 
} from './utils/helpers'
import ENR1MClient from './client/ENR1MClient'

// Factory function for easy client creation
export function createENR1MClient(config: {
  chainId: SupportedChainId
  rpcUrl?: string
  addresses?: Partial<ContractAddresses>
  publicClient?: PublicClient
  walletClient?: WalletClient
}) {
  const chainConfig = getChainConfig(config.chainId)
  const viemChain = getViemChain(config.chainId)
  
  const publicClient = config.publicClient || createPublicClient({
    chain: viemChain,
    transport: http(config.rpcUrl || chainConfig.rpcUrl)
  })
  
  const addresses: ContractAddresses = {
    ...chainConfig.contracts,
    ...config.addresses
  }
  
  return new ENR1MClient({
    addresses,
    publicClient,
    walletClient: config.walletClient
  })
}

// Re-export commonly used viem types
export type { Address, Hash, PublicClient, WalletClient }

// Package info
export const VERSION = '1.0.0'
export const NAME = '@enr1m/sdk'

export default ENR1MClient