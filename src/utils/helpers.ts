/**
 * Utility functions and helpers for ENR1M SDK
 */

import { type Address, type Chain, type Hash, keccak256, toHex } from 'viem'
import { polygon, polygonMumbai, localhost } from 'viem/chains'
import type { ChainConfig, SupportedChainId, SUPPORTED_CHAINS } from '../types/contracts'

// ========== Chain Configurations ==========

export const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  [137]: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    contracts: {
      token: '0x0000000000000000000000000000000000000000' as Address, // To be deployed
      distributor: '0x0000000000000000000000000000000000000000' as Address,
      revenueVault: '0x0000000000000000000000000000000000000000' as Address,
      usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address // USDC on Polygon
    }
  },
  [80001]: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    contracts: {
      token: '0x0000000000000000000000000000000000000000' as Address, // To be deployed
      distributor: '0x0000000000000000000000000000000000000000' as Address,
      revenueVault: '0x0000000000000000000000000000000000000000' as Address,
      usdc: '0x0000000000000000000000000000000000000000' as Address // Mock USDC
    }
  },
  [31337]: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: undefined,
    contracts: {
      token: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address, // From START_HERE.md
      distributor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address,
      revenueVault: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address,
      usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address // Mock USDC
    }
  },
  [246]: {
    chainId: 246,
    name: 'Energy Web Chain',
    rpcUrl: 'https://rpc.energyweb.org',
    blockExplorer: 'https://explorer.energyweb.org',
    contracts: {
      token: '0x0000000000000000000000000000000000000000' as Address, // To be deployed
      distributor: '0x0000000000000000000000000000000000000000' as Address,
      revenueVault: '0x0000000000000000000000000000000000000000' as Address,
      usdc: '0x0000000000000000000000000000000000000000' as Address // USDC equivalent
    }
  }
}

export function getChainConfig(chainId: SupportedChainId): ChainConfig {
  const config = CHAIN_CONFIGS[chainId]
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return config
}

export function getViemChain(chainId: SupportedChainId): Chain {
  switch (chainId) {
    case 137:
      return polygon
    case 80001:
      return polygonMumbai
    case 31337:
      return localhost
    case 246:
      return {
        id: 246,
        name: 'Energy Web Chain',
        nativeCurrency: {
          decimals: 18,
          name: 'Energy Web Token',
          symbol: 'EWT'
        },
        rpcUrls: {
          default: {
            http: ['https://rpc.energyweb.org']
          },
          public: {
            http: ['https://rpc.energyweb.org']
          }
        },
        blockExplorers: {
          default: {
            name: 'Energy Web Chain Explorer',
            url: 'https://explorer.energyweb.org'
          }
        }
      }
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

// ========== Role Helpers ==========

export const ROLES = {
  ADMIN: keccak256(toHex('ADMIN_ROLE')),
  OPERATOR: keccak256(toHex('OPERATOR_ROLE')),
  PAUSER: keccak256(toHex('PAUSER_ROLE'))
} as const

export function getRoleHash(roleName: keyof typeof ROLES): Hash {
  return ROLES[roleName]
}

// ========== Time Helpers ==========

export function getRecordDate(year: number, month: number): Date {
  // Record date is typically the 25th of each month
  return new Date(year, month - 1, 25)
}

export function getDistributionDate(year: number, month: number): Date {
  // Distribution typically happens on the 26th
  return new Date(year, month - 1, 26)
}

export function getClaimDeadline(distributionDate: Date, deadlineDays: number = 90): Date {
  const deadline = new Date(distributionDate)
  deadline.setDate(deadline.getDate() + deadlineDays)
  return deadline
}

export function isClaimDeadlinePassed(distributionTimestamp: bigint, deadlineDays: bigint): boolean {
  const distributionDate = new Date(Number(distributionTimestamp) * 1000)
  const deadline = getClaimDeadline(distributionDate, Number(deadlineDays))
  return new Date() > deadline
}

// ========== Amount Formatting ==========

export function formatTokenDisplay(amount: bigint, decimals: number = 18): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const fraction = amount % divisor
  
  if (fraction === 0n) {
    return whole.toString()
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0')
  const trimmedFraction = fractionStr.replace(/0+$/, '')
  
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString()
}

export function formatUSDCDisplay(amount: bigint): string {
  return formatTokenDisplay(amount, 6)
}

export function formatPercentage(numerator: bigint, denominator: bigint, decimals: number = 2): string {
  if (denominator === 0n) return '0%'
  
  const percentage = (numerator * 10000n) / denominator // 2 decimal places
  const whole = percentage / 100n
  const fraction = percentage % 100n
  
  if (fraction === 0n) {
    return `${whole}%`
  }
  
  const fractionStr = fraction.toString().padStart(2, '0')
  return `${whole}.${fractionStr}%`
}

// ========== Calculation Helpers ==========

export function calculateUserShare(
  userBalance: bigint,
  totalDistribution: bigint,
  eligibleSupply: bigint
): bigint {
  if (eligibleSupply === 0n) return 0n
  return (totalDistribution * userBalance) / eligibleSupply
}

export function calculateAPY(
  monthlyDistribution: bigint,
  userBalance: bigint,
  eligibleSupply: bigint,
  tokenPriceUSD: number = 1.0 // Default $1 per token
): number {
  if (eligibleSupply === 0n || userBalance === 0n) return 0
  
  const userShare = calculateUserShare(userBalance, monthlyDistribution, eligibleSupply)
  const userShareUSD = Number(formatUSDCDisplay(userShare))
  const userBalanceUSD = Number(formatTokenDisplay(userBalance)) * tokenPriceUSD
  
  if (userBalanceUSD === 0) return 0
  
  const monthlyReturn = userShareUSD / userBalanceUSD
  const annualReturn = monthlyReturn * 12
  
  return annualReturn * 100 // Convert to percentage
}

// ========== Validation Helpers ==========

export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidHash(hash: string): hash is Hash {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

export function validateSnapshotId(snapshotId: bigint): boolean {
  return snapshotId > 0n
}

export function validateAmount(amount: bigint): boolean {
  return amount > 0n
}

// ========== Error Handling ==========

export function parseContractError(error: unknown): string {
  if (typeof error === 'string') return error
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    
    // Parse common contract errors
    if (message.includes('Pausable: paused')) {
      return 'Contract is currently paused'
    }
    if (message.includes('AccessControl:')) {
      return 'Insufficient permissions for this operation'
    }
    if (message.includes('Already claimed')) {
      return 'You have already claimed for this snapshot'
    }
    if (message.includes('Nothing to claim')) {
      return 'No claimable amount available'
    }
    if (message.includes('Deadline not reached')) {
      return 'Claim deadline has not been reached yet'
    }
    if (message.includes('Insufficient balance')) {
      return 'Insufficient balance for this transaction'
    }
    
    return message
  }
  
  return 'Unknown error occurred'
}

// ========== Event Helpers ==========

export function decodeSnapshotCreatedEvent(log: any): {
  snapshotId: bigint
  timestamp: bigint
} {
  // This would be implemented with proper event decoding
  // For now, returning placeholder
  return {
    snapshotId: BigInt(log.topics[1] || '0'),
    timestamp: BigInt(Date.now() / 1000)
  }
}

export function decodeClaimedEvent(log: any): {
  snapshotId: bigint
  user: Address
  amount: bigint
  timestamp: bigint
} {
  // This would be implemented with proper event decoding
  // For now, returning placeholder
  return {
    snapshotId: BigInt(log.topics[1] || '0'),
    user: `0x${log.topics[2]?.slice(-40)}` as Address,
    amount: BigInt(log.data || '0'),
    timestamp: BigInt(Date.now() / 1000)
  }
}

// ========== Constants ==========

export const CONSTANTS = {
  // Token decimals
  ENR1M_DECIMALS: 18,
  USDC_DECIMALS: 6,
  
  // Total supply
  TOTAL_SUPPLY: 350_000n * 10n ** 18n, // 350,000 ENR1M tokens
  
  // Default values
  DEFAULT_CLAIM_DEADLINE_DAYS: 90,
  DEFAULT_MIN_DEPOSIT: 1000n * 10n ** 6n, // 1,000 USDC
  DEFAULT_TOKEN_PRICE: 1.0, // $1 per token
  
  // Gas limits (estimated)
  GAS_LIMITS: {
    SNAPSHOT: 100_000n,
    CLAIM: 80_000n,
    CLAIM_MULTIPLE: 150_000n,
    DEPOSIT: 120_000n,
    DISTRIBUTE: 100_000n,
    TOKEN_TRANSFER: 65_000n
  }
} as const

export default {
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
  decodeSnapshotCreatedEvent,
  decodeClaimedEvent,
  CONSTANTS,
  ROLES,
  CHAIN_CONFIGS
}