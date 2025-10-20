/**
 * TypeScript types for ENR1M smart contracts
 * Generated using Viem + ABIType for type safety
 */

import type { Address, Hash, PublicClient, WalletClient } from 'viem'
import type { 
  ENR1M_TOKEN_ABI, 
  DISTRIBUTOR_ABI, 
  REVENUE_VAULT_ABI, 
  TOKEN_SALE_ABI,
  MOCK_USDC_ABI
} from '../contracts/abis'

// Contract address types
export interface ContractAddresses {
  token: Address
  distributor: Address
  revenueVault: Address
  tokenSale?: Address
  usdc: Address
}

// Contract client configuration
export interface ContractConfig {
  addresses: ContractAddresses
  publicClient: PublicClient
  walletClient?: WalletClient
}

// ENR1M Token types
export type ENR1MTokenABI = typeof ENR1M_TOKEN_ABI
export type DistributorABI = typeof DISTRIBUTOR_ABI
export type RevenueVaultABI = typeof REVENUE_VAULT_ABI
export type TokenSaleABI = typeof TOKEN_SALE_ABI
export type MockUSDCABI = typeof MOCK_USDC_ABI

// Distribution info structure
export interface DistributionInfo {
  totalAmount: bigint
  claimedAmount: bigint
  createdAt: bigint
  deadlineAt: bigint
  isActive: boolean
}

// User balance and claimable info
export interface UserInfo {
  balance: bigint
  balanceAtSnapshot: bigint
  claimableAmount: bigint
  hasClaimed: boolean
}

// Monthly operation workflow types
export interface MonthlyOperationParams {
  monthlyRevenue: bigint
  snapshotId?: bigint
}

// Snapshot creation result
export interface SnapshotResult {
  snapshotId: bigint
  blockNumber: bigint
  timestamp: bigint
  totalSupply: bigint
  eligibleSupply: bigint
}

// Distribution creation result
export interface DistributionResult {
  snapshotId: bigint
  amount: bigint
  timestamp: bigint
  transactionHash: Hash
}

// Claim result
export interface ClaimResult {
  snapshotId: bigint
  amount: bigint
  user: Address
  timestamp: bigint
  transactionHash: Hash
}

// Token sale types
export interface TokenPurchase {
  buyer: Address
  tokenAmount: bigint
  usdcAmount: bigint
  timestamp: bigint
  transactionHash: Hash
}

// System status
export interface SystemStatus {
  token: {
    totalSupply: bigint
    paused: boolean
    currentSnapshotId: bigint
  }
  vault: {
    balance: bigint
    totalReceived: bigint
    totalDistributed: bigint
    paused: boolean
  }
  distributor: {
    balance: bigint
    claimDeadlineDays: bigint
    paused: boolean
  }
  tokenSale?: {
    active: boolean
    pricePerToken: bigint
    totalSold: bigint
    totalRaised: bigint
    availableTokens: bigint
  }
}

// Event types for real-time monitoring
export interface ContractEvents {
  // Token events
  onSnapshotCreated?: (snapshotId: bigint, timestamp: bigint) => void
  onTransfer?: (from: Address, to: Address, amount: bigint) => void
  
  // Distributor events
  onDistributionScheduled?: (snapshotId: bigint, amount: bigint, timestamp: bigint) => void
  onClaimed?: (snapshotId: bigint, user: Address, amount: bigint, timestamp: bigint) => void
  onUnclaimedSwept?: (snapshotId: bigint, amount: bigint, to: Address, timestamp: bigint) => void
  
  // Vault events
  onDeposited?: (from: Address, amount: bigint, timestamp: bigint) => void
  onFundedDistribution?: (amount: bigint, timestamp: bigint) => void
  
  // Sale events
  onTokensPurchased?: (buyer: Address, tokenAmount: bigint, usdcAmount: bigint, timestamp: bigint) => void
}

// Error types
export class ENR1MSDKError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ENR1MSDKError'
  }
}

export class ContractInteractionError extends ENR1MSDKError {
  constructor(
    message: string,
    public contractName: string,
    public functionName: string,
    public originalError?: unknown
  ) {
    super(message, 'CONTRACT_INTERACTION_ERROR', originalError)
  }
}

export class InsufficientBalanceError extends ENR1MSDKError {
  constructor(
    public required: bigint,
    public available: bigint,
    public token: string = 'USDC'
  ) {
    super(
      `Insufficient ${token} balance. Required: ${required.toString()}, Available: ${available.toString()}`,
      'INSUFFICIENT_BALANCE'
    )
  }
}

export class InvalidSnapshotError extends ENR1MSDKError {
  constructor(public snapshotId: bigint) {
    super(`Invalid or non-existent snapshot ID: ${snapshotId.toString()}`, 'INVALID_SNAPSHOT')
  }
}

export class ClaimDeadlinePassedError extends ENR1MSDKError {
  constructor(public snapshotId: bigint, public deadline: bigint) {
    super(
      `Claim deadline passed for snapshot ${snapshotId.toString()}. Deadline was: ${new Date(Number(deadline) * 1000).toISOString()}`,
      'CLAIM_DEADLINE_PASSED'
    )
  }
}

// Chain configuration
export interface ChainConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer?: string
  contracts: ContractAddresses
}

// Supported networks
export const SUPPORTED_CHAINS = {
  POLYGON: 137,
  MUMBAI: 80001,
  LOCALHOST: 31337,
  ENERGY_WEB: 246
} as const

export type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS]