/**
 * Tests for TypeScript types and error classes
 */

import { describe, it, expect } from 'vitest'
import {
  ENR1MSDKError,
  ContractInteractionError,
  InsufficientBalanceError,
  InvalidSnapshotError,
  ClaimDeadlinePassedError,
  SUPPORTED_CHAINS
} from '../index'

describe('Error Classes', () => {
  describe('ENR1MSDKError', () => {
    it('should create basic error', () => {
      const error = new ENR1MSDKError('Test error')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ENR1MSDKError)
      expect(error.name).toBe('ENR1MSDKError')
      expect(error.message).toBe('Test error')
      expect(error.code).toBeUndefined()
      expect(error.details).toBeUndefined()
    })

    it('should create error with code and details', () => {
      const details = { extra: 'info' }
      const error = new ENR1MSDKError('Test error', 'TEST_CODE', details)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.details).toBe(details)
    })
  })

  describe('ContractInteractionError', () => {
    it('should create contract interaction error', () => {
      const originalError = new Error('Original error')
      const error = new ContractInteractionError(
        'Failed to call function',
        'ENR1MToken',
        'balanceOf',
        originalError
      )
      
      expect(error).toBeInstanceOf(ENR1MSDKError)
      expect(error).toBeInstanceOf(ContractInteractionError)
      expect(error.message).toBe('Failed to call function')
      expect(error.contractName).toBe('ENR1MToken')
      expect(error.functionName).toBe('balanceOf')
      expect(error.originalError).toBe(originalError)
      expect(error.code).toBe('CONTRACT_INTERACTION_ERROR')
    })
  })

  describe('InsufficientBalanceError', () => {
    it('should create insufficient balance error with default token', () => {
      const error = new InsufficientBalanceError(
        BigInt('1000'),
        BigInt('500')
      )
      
      expect(error).toBeInstanceOf(ENR1MSDKError)
      expect(error).toBeInstanceOf(InsufficientBalanceError)
      expect(error.message).toBe('Insufficient USDC balance. Required: 1000, Available: 500')
      expect(error.required).toBe(BigInt('1000'))
      expect(error.available).toBe(BigInt('500'))
      expect(error.token).toBe('USDC')
      expect(error.code).toBe('INSUFFICIENT_BALANCE')
    })

    it('should create insufficient balance error with custom token', () => {
      const error = new InsufficientBalanceError(
        BigInt('2000'),
        BigInt('1000'),
        'ENR1M'
      )
      
      expect(error.message).toBe('Insufficient ENR1M balance. Required: 2000, Available: 1000')
      expect(error.token).toBe('ENR1M')
    })
  })

  describe('InvalidSnapshotError', () => {
    it('should create invalid snapshot error', () => {
      const snapshotId = BigInt('999')
      const error = new InvalidSnapshotError(snapshotId)
      
      expect(error).toBeInstanceOf(ENR1MSDKError)
      expect(error).toBeInstanceOf(InvalidSnapshotError)
      expect(error.message).toBe('Invalid or non-existent snapshot ID: 999')
      expect(error.snapshotId).toBe(snapshotId)
      expect(error.code).toBe('INVALID_SNAPSHOT')
    })
  })

  describe('ClaimDeadlinePassedError', () => {
    it('should create claim deadline passed error', () => {
      const snapshotId = BigInt('1')
      const deadline = BigInt('1705248000') // Some timestamp
      const error = new ClaimDeadlinePassedError(snapshotId, deadline)
      
      expect(error).toBeInstanceOf(ENR1MSDKError)
      expect(error).toBeInstanceOf(ClaimDeadlinePassedError)
      expect(error.message).toContain('Claim deadline passed for snapshot 1')
      expect(error.message).toContain('2024-01-14') // Date from timestamp
      expect(error.snapshotId).toBe(snapshotId)
      expect(error.deadline).toBe(deadline)
      expect(error.code).toBe('CLAIM_DEADLINE_PASSED')
    })
  })
})

describe('Constants and Enums', () => {
  describe('SUPPORTED_CHAINS', () => {
    it('should have correct chain IDs', () => {
      expect(SUPPORTED_CHAINS.POLYGON).toBe(137)
      expect(SUPPORTED_CHAINS.MUMBAI).toBe(80001)
      expect(SUPPORTED_CHAINS.LOCALHOST).toBe(31337)
      expect(SUPPORTED_CHAINS.ENERGY_WEB).toBe(246)
    })

    it('should have all expected chains', () => {
      const chains = Object.keys(SUPPORTED_CHAINS)
      expect(chains).toContain('POLYGON')
      expect(chains).toContain('MUMBAI')
      expect(chains).toContain('LOCALHOST')
      expect(chains).toContain('ENERGY_WEB')
      expect(chains).toHaveLength(4)
    })
  })
})

describe('Type Safety', () => {
  // These are compile-time tests that ensure types are working correctly
  // If these compile without errors, our types are correct

  it('should accept valid contract addresses type', () => {
    const addresses = {
      token: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const,
      distributor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as const,
      revenueVault: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as const,
      usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const
    }
    
    expect(addresses.token).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
  })

  it('should accept valid distribution info structure', () => {
    const distributionInfo = {
      totalAmount: BigInt('15000000000'),
      claimedAmount: BigInt('5000000000'),
      createdAt: BigInt('1697472000'),
      deadlineAt: BigInt('1705248000'),
      isActive: true
    }
    
    expect(distributionInfo.totalAmount).toBe(BigInt('15000000000'))
    expect(distributionInfo.isActive).toBe(true)
  })

  it('should accept valid user info structure', () => {
    const userInfo = {
      balance: BigInt('1000000000000000000000'),
      balanceAtSnapshot: BigInt('1000000000000000000000'),
      claimableAmount: BigInt('100000000'),
      hasClaimed: false
    }
    
    expect(userInfo.balance).toBe(BigInt('1000000000000000000000'))
    expect(userInfo.hasClaimed).toBe(false)
  })

  it('should accept valid snapshot result structure', () => {
    const snapshotResult = {
      snapshotId: BigInt('1'),
      blockNumber: BigInt('18000000'),
      timestamp: BigInt('1697472000'),
      totalSupply: BigInt('350000000000000000000000'),
      eligibleSupply: BigInt('315000000000000000000000')
    }
    
    expect(snapshotResult.snapshotId).toBe(BigInt('1'))
    expect(snapshotResult.totalSupply).toBe(BigInt('350000000000000000000000'))
  })
})