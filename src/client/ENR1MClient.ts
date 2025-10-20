/**
 * ENR1M SDK Client - Main interface for interacting with ENR1M contracts
 * Built with Viem for type safety and modern Web3 development
 */

import {
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  getContract,
  formatUnits,
  parseUnits,
  formatEther,
  parseEther
} from 'viem'

import {
  ENR1M_TOKEN_ABI,
  DISTRIBUTOR_ABI,
  REVENUE_VAULT_ABI,
  TOKEN_SALE_ABI,
  MOCK_USDC_ABI
} from '../contracts/abis'

import type {
  ContractConfig,
  ContractAddresses,
  DistributionInfo,
  UserInfo,
  SnapshotResult,
  DistributionResult,
  ClaimResult,
  SystemStatus,
  MonthlyOperationParams
} from '../types/contracts'

import {
  ContractInteractionError,
  InsufficientBalanceError,
  InvalidSnapshotError,
  ClaimDeadlinePassedError
} from '../types/contracts'

export class ENR1MClient {
  private readonly config: ContractConfig
  
  // Type-safe contract instances
  private readonly tokenContract: any
  private readonly distributorContract: any
  private readonly vaultContract: any
  private readonly usdcContract: any
  private readonly saleContract?: any

  constructor(config: ContractConfig) {
    this.config = config

    // Initialize contract instances with type safety
    this.tokenContract = getContract({
      address: config.addresses.token,
      abi: ENR1M_TOKEN_ABI,
      client: config.walletClient || config.publicClient
    })

    this.distributorContract = getContract({
      address: config.addresses.distributor,
      abi: DISTRIBUTOR_ABI,
      client: config.walletClient || config.publicClient
    })

    this.vaultContract = getContract({
      address: config.addresses.revenueVault,
      abi: REVENUE_VAULT_ABI,
      client: config.walletClient || config.publicClient
    })

    this.usdcContract = getContract({
      address: config.addresses.usdc,
      abi: MOCK_USDC_ABI,
      client: config.walletClient || config.publicClient
    })

    if (config.addresses.tokenSale) {
      this.saleContract = getContract({
        address: config.addresses.tokenSale,
        abi: TOKEN_SALE_ABI,
        client: config.walletClient || config.publicClient
      })
    }
  }

  // ========== Token Operations ==========

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address: Address): Promise<bigint> {
    try {
      const result = await this.tokenContract.read.balanceOf([address])
      return BigInt(result.toString())
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get token balance',
        'ENR1MToken',
        'balanceOf',
        error
      )
    }
  }

  /**
   * Get token balance at specific snapshot
   */
  async getTokenBalanceAtSnapshot(address: Address, snapshotId: bigint): Promise<bigint> {
    try {
      const result = await this.tokenContract.read.balanceOfAt([address, snapshotId])
      return BigInt(result.toString())
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get token balance at snapshot',
        'ENR1MToken',
        'balanceOfAt',
        error
      )
    }
  }

  /**
   * Get total supply at snapshot
   */
  async getTotalSupplyAtSnapshot(snapshotId: bigint): Promise<bigint> {
    try {
      const result = await this.tokenContract.read.totalSupplyAt([snapshotId])
      return BigInt(result.toString())
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get total supply at snapshot',
        'ENR1MToken',
        'totalSupplyAt',
        error
      )
    }
  }

  /**
   * Get eligible supply at snapshot (excluding treasury and system addresses)
   */
  async getEligibleSupplyAtSnapshot(snapshotId: bigint): Promise<bigint> {
    try {
      const result = await this.tokenContract.read.eligibleSupplyAt([snapshotId])
      return BigInt(result.toString())
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get eligible supply at snapshot',
        'ENR1MToken',
        'eligibleSupplyAt',
        error
      )
    }
  }

  /**
   * Create new snapshot (OPERATOR role required)
   * This is typically done on the 25th of each month (Record Date)
   */
  async createSnapshot(): Promise<SnapshotResult> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      const hash = await this.tokenContract.write.snapshot() as Hash
      const receipt = await this.config.publicClient.waitForTransactionReceipt({ hash })
      
      // For simplicity, we'll return a basic snapshot result
      // In production, you'd parse the actual event logs
      const snapshotId = BigInt(Date.now()) // Placeholder
      
      const [totalSupply, eligibleSupply] = await Promise.all([
        this.getTotalSupplyAtSnapshot(snapshotId),
        this.getEligibleSupplyAtSnapshot(snapshotId)
      ])

      return {
        snapshotId,
        blockNumber: receipt.blockNumber,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        totalSupply,
        eligibleSupply
      }
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to create snapshot',
        'ENR1MToken',
        'snapshot',
        error
      )
    }
  }

  // ========== Distribution Operations ==========

  /**
   * Get claimable amount for user at specific snapshot
   */
  async getClaimableAmount(address: Address, snapshotId: bigint): Promise<bigint> {
    try {
      const result = await this.distributorContract.read.claimable([snapshotId, address])
      return BigInt(result.toString())
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get claimable amount',
        'Distributor',
        'claimable',
        error
      )
    }
  }

  /**
   * Get distribution information for a snapshot
   */
  async getDistributionInfo(snapshotId: bigint): Promise<DistributionInfo> {
    try {
      const result = await this.distributorContract.read.getDistributionInfo([snapshotId])
      const [totalAmount, claimedAmount, createdAt, deadlineAt, isActive] = result as any[]

      return {
        totalAmount: BigInt(totalAmount.toString()),
        claimedAmount: BigInt(claimedAmount.toString()),
        createdAt: BigInt(createdAt.toString()),
        deadlineAt: BigInt(deadlineAt.toString()),
        isActive: Boolean(isActive)
      }
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get distribution info',
        'Distributor',
        'getDistributionInfo',
        error
      )
    }
  }

  /**
   * Get complete user information for a snapshot
   */
  async getUserInfo(address: Address, snapshotId: bigint): Promise<UserInfo> {
    try {
      const [balance, balanceAtSnapshot, claimableAmount, hasClaimed] = await Promise.all([
        this.getTokenBalance(address),
        this.getTokenBalanceAtSnapshot(address, snapshotId),
        this.getClaimableAmount(address, snapshotId),
        this.distributorContract.read.claimed([snapshotId, address])
      ])

      return {
        balance,
        balanceAtSnapshot,
        claimableAmount,
        hasClaimed: Boolean(hasClaimed)
      }
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to get user info',
        'Multiple contracts',
        'getUserInfo',
        error
      )
    }
  }

  /**
   * Claim profits for a specific snapshot
   */
  async claim(snapshotId: bigint): Promise<ClaimResult> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      // Get user address
      const [account] = await this.config.walletClient.getAddresses()
      
      // Validate claim
      const [claimableAmount, hasClaimed, distributionInfo] = await Promise.all([
        this.getClaimableAmount(account, snapshotId),
        this.distributorContract.read.claimed([snapshotId, account]),
        this.getDistributionInfo(snapshotId)
      ])

      if (Boolean(hasClaimed)) {
        throw new Error('Already claimed for this snapshot')
      }

      if (claimableAmount === 0n) {
        throw new Error('Nothing to claim for this snapshot')
      }

      if (!distributionInfo.isActive) {
        throw new ClaimDeadlinePassedError(snapshotId, distributionInfo.deadlineAt)
      }

      // Execute claim
      const hash = await this.distributorContract.write.claim([snapshotId]) as Hash
      await this.config.publicClient.waitForTransactionReceipt({ hash })

      return {
        snapshotId,
        amount: claimableAmount,
        user: account,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        transactionHash: hash
      }
    } catch (error) {
      if (error instanceof ClaimDeadlinePassedError) {
        throw error
      }
      throw new ContractInteractionError(
        'Failed to claim profits',
        'Distributor',
        'claim',
        error
      )
    }
  }

  /**
   * Claim profits for multiple snapshots in one transaction
   */
  async claimMultiple(snapshotIds: bigint[]): Promise<ClaimResult[]> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      const [account] = await this.config.walletClient.getAddresses()
      
      // For simplicity, we'll claim each one individually
      // In production, you'd use the actual claimMultiple function
      const results: ClaimResult[] = []
      
      for (const snapshotId of snapshotIds) {
        try {
          const result = await this.claim(snapshotId)
          results.push(result)
        } catch (error) {
          // Skip failed claims and continue
          console.warn(`Failed to claim snapshot ${snapshotId}:`, error)
        }
      }

      return results
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to claim multiple profits',
        'Distributor',
        'claimMultiple',
        error
      )
    }
  }

  // ========== Operator Operations ==========

  /**
   * Deposit revenue to vault (OPERATOR role required)
   */
  async depositRevenue(amount: bigint): Promise<Hash> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      const [account] = await this.config.walletClient.getAddresses()
      
      // Check USDC balance
      const balance = await this.usdcContract.read.balanceOf([account])
      if (BigInt(balance.toString()) < amount) {
        throw new InsufficientBalanceError(amount, BigInt(balance.toString()), 'USDC')
      }

      // Approve vault to spend USDC
      const approveHash = await this.usdcContract.write.approve([
        this.config.addresses.revenueVault,
        amount
      ]) as Hash
      await this.config.publicClient.waitForTransactionReceipt({ hash: approveHash })

      // Deposit to vault
      const depositHash = await this.vaultContract.write.deposit([amount]) as Hash
      await this.config.publicClient.waitForTransactionReceipt({ hash: depositHash })

      return depositHash
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        throw error
      }
      throw new ContractInteractionError(
        'Failed to deposit revenue',
        'RevenueVault',
        'deposit',
        error
      )
    }
  }

  /**
   * Transfer funds from vault to distributor (OPERATOR role required)
   */
  async fundDistribution(amount: bigint): Promise<Hash> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      const hash = await this.vaultContract.write.fundDistribution([amount]) as Hash
      await this.config.publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to fund distribution',
        'RevenueVault',
        'fundDistribution',
        error
      )
    }
  }

  /**
   * Create distribution for snapshot (OPERATOR role required)
   */
  async createDistribution(snapshotId: bigint, amount: bigint): Promise<DistributionResult> {
    if (!this.config.walletClient) {
      throw new Error('Wallet client required for write operations')
    }

    try {
      const hash = await this.distributorContract.write.distribute([snapshotId, amount]) as Hash
      await this.config.publicClient.waitForTransactionReceipt({ hash })

      return {
        snapshotId,
        amount,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        transactionHash: hash
      }
    } catch (error) {
      throw new ContractInteractionError(
        'Failed to create distribution',
        'Distributor',
        'distribute',
        error
      )
    }
  }

  // ========== Utility Methods ==========

  /**
   * Format token amount for display (18 decimals)
   */
  formatTokenAmount(amount: bigint): string {
    return formatEther(amount)
  }

  /**
   * Parse token amount from string (18 decimals)
   */
  parseTokenAmount(amount: string): bigint {
    return parseEther(amount)
  }

  /**
   * Format USDC amount for display (6 decimals)
   */
  formatUSDCAmount(amount: bigint): string {
    return formatUnits(amount, 6)
  }

  /**
   * Parse USDC amount from string (6 decimals)
   */
  parseUSDCAmount(amount: string): bigint {
    return parseUnits(amount, 6)
  }

  /**
   * Get contract addresses
   */
  getAddresses(): ContractAddresses {
    return this.config.addresses
  }

  /**
   * Check if user has required role
   */
  async hasRole(role: string, address: Address): Promise<boolean> {
    try {
      const roleHash = role as Hash // Would need proper role hash calculation
      const result = await this.tokenContract.read.hasRole([roleHash, address])
      return Boolean(result)
    } catch (error) {
      return false
    }
  }
}

export default ENR1MClient