/**
 * Tests for utility helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  formatTokenDisplay,
  formatUSDCDisplay,
  formatPercentage,
  calculateUserShare,
  calculateAPY,
  getRecordDate,
  getDistributionDate,
  getClaimDeadline,
  isClaimDeadlinePassed,
  isValidAddress,
  isValidHash,
  validateSnapshotId,
  validateAmount,
  parseContractError,
  CONSTANTS
} from '../utils/helpers'

describe('Utility Helpers', () => {
  describe('Amount Formatting', () => {
    it('should format token amounts correctly', () => {
      expect(formatTokenDisplay(BigInt('1000000000000000000'), 18)).toBe('1')
      expect(formatTokenDisplay(BigInt('1500000000000000000'), 18)).toBe('1.5')
      expect(formatTokenDisplay(BigInt('1000000000000000000000'), 18)).toBe('1000')
      expect(formatTokenDisplay(BigInt('0'), 18)).toBe('0')
    })

    it('should format USDC amounts correctly', () => {
      expect(formatUSDCDisplay(BigInt('1000000'))).toBe('1')
      expect(formatUSDCDisplay(BigInt('1500000'))).toBe('1.5')
      expect(formatUSDCDisplay(BigInt('1000000000'))).toBe('1000')
      expect(formatUSDCDisplay(BigInt('0'))).toBe('0')
    })

    it('should format percentages correctly', () => {
      expect(formatPercentage(BigInt('50'), BigInt('100'), 2)).toBe('50%')
      expect(formatPercentage(BigInt('3333'), BigInt('10000'), 2)).toBe('33.33%')
      expect(formatPercentage(BigInt('0'), BigInt('100'), 2)).toBe('0%')
      expect(formatPercentage(BigInt('100'), BigInt('0'), 2)).toBe('0%')
    })
  })

  describe('Calculations', () => {
    it('should calculate user share correctly', () => {
      const userBalance = BigInt('10000000000000000000000') // 10,000 tokens
      const totalDistribution = BigInt('15000000000') // 15,000 USDC
      const eligibleSupply = BigInt('315000000000000000000000') // 315,000 tokens
      
      const share = calculateUserShare(userBalance, totalDistribution, eligibleSupply)
      expect(share).toBe(BigInt('476190476')) // ~476.19 USDC
    })

    it('should handle zero eligible supply', () => {
      const userBalance = BigInt('10000000000000000000000')
      const totalDistribution = BigInt('15000000000')
      const eligibleSupply = BigInt('0')
      
      const share = calculateUserShare(userBalance, totalDistribution, eligibleSupply)
      expect(share).toBe(BigInt('0'))
    })

    it('should calculate APY correctly', () => {
      const monthlyDistribution = BigInt('15000000000') // 15,000 USDC
      const userBalance = BigInt('10000000000000000000000') // 10,000 tokens
      const eligibleSupply = BigInt('315000000000000000000000') // 315,000 tokens
      const tokenPriceUSD = 1.0
      
      const apy = calculateAPY(monthlyDistribution, userBalance, eligibleSupply, tokenPriceUSD)
      expect(apy).toBeCloseTo(57.14, 1) // ~57.14% APY
    })

    it('should handle zero user balance for APY', () => {
      const monthlyDistribution = BigInt('15000000000')
      const userBalance = BigInt('0')
      const eligibleSupply = BigInt('315000000000000000000000')
      
      const apy = calculateAPY(monthlyDistribution, userBalance, eligibleSupply)
      expect(apy).toBe(0)
    })
  })

  describe('Time Helpers', () => {
    it('should get correct record date', () => {
      const recordDate = getRecordDate(2024, 10) // October 2024
      expect(recordDate.getDate()).toBe(25)
      expect(recordDate.getMonth()).toBe(9) // October is month 9 (0-indexed)
      expect(recordDate.getFullYear()).toBe(2024)
    })

    it('should get correct distribution date', () => {
      const distributionDate = getDistributionDate(2024, 10) // October 2024
      expect(distributionDate.getDate()).toBe(26)
      expect(distributionDate.getMonth()).toBe(9)
      expect(distributionDate.getFullYear()).toBe(2024)
    })

    it('should get correct claim deadline', () => {
      const distributionDate = new Date(2024, 9, 26) // Oct 26, 2024
      const deadline = getClaimDeadline(distributionDate, 90)
      
      expect(deadline.getDate()).toBe(24)
      expect(deadline.getMonth()).toBe(0) // January (0-indexed)
      expect(deadline.getFullYear()).toBe(2025)
    })

    it('should check if claim deadline passed', () => {
      const pastTimestamp = BigInt(Math.floor(Date.now() / 1000) - 100 * 24 * 60 * 60) // 100 days ago
      const futureTimestamp = BigInt(Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60) // 10 days from now
      const deadlineDays = BigInt(90)
      
      expect(isClaimDeadlinePassed(pastTimestamp, deadlineDays)).toBe(true)
      expect(isClaimDeadlinePassed(futureTimestamp, deadlineDays)).toBe(false)
    })
  })

  describe('Validation', () => {
    it('should validate addresses correctly', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f')).toBe(true)
      expect(isValidAddress('0x742d35cc6634c0532925a3b8d84eb5b4fa4fcd3f')).toBe(true) // lowercase
      expect(isValidAddress('0x742d35')).toBe(false) // too short
      expect(isValidAddress('742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f')).toBe(false) // no 0x
      expect(isValidAddress('0xGGGd35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f')).toBe(false) // invalid hex
    })

    it('should validate hashes correctly', () => {
      expect(isValidHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(true)
      expect(isValidHash('0x123456')).toBe(false) // too short
      expect(isValidHash('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(false) // no 0x
    })

    it('should validate snapshot IDs', () => {
      expect(validateSnapshotId(BigInt('1'))).toBe(true)
      expect(validateSnapshotId(BigInt('999'))).toBe(true)
      expect(validateSnapshotId(BigInt('0'))).toBe(false)
    })

    it('should validate amounts', () => {
      expect(validateAmount(BigInt('1'))).toBe(true)
      expect(validateAmount(BigInt('1000000'))).toBe(true)
      expect(validateAmount(BigInt('0'))).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should parse string errors', () => {
      expect(parseContractError('Custom error message')).toBe('Custom error message')
    })

    it('should parse object errors with message', () => {
      const error = { message: 'Pausable: paused' }
      expect(parseContractError(error)).toBe('Contract is currently paused')
    })

    it('should parse AccessControl errors', () => {
      const error = { message: 'AccessControl: account missing role' }
      expect(parseContractError(error)).toBe('Insufficient permissions for this operation')
    })

    it('should parse common contract errors', () => {
      expect(parseContractError({ message: 'Already claimed' })).toBe('You have already claimed for this snapshot')
      expect(parseContractError({ message: 'Nothing to claim' })).toBe('No claimable amount available')
      expect(parseContractError({ message: 'Insufficient balance' })).toBe('Insufficient balance for this transaction')
    })

    it('should handle unknown errors', () => {
      expect(parseContractError(null)).toBe('Unknown error occurred')
      expect(parseContractError(undefined)).toBe('Unknown error occurred')
      expect(parseContractError({})).toBe('Unknown error occurred')
    })
  })

  describe('Constants', () => {
    it('should have correct token decimals', () => {
      expect(CONSTANTS.ENR1M_DECIMALS).toBe(18)
      expect(CONSTANTS.USDC_DECIMALS).toBe(6)
    })

    it('should have correct total supply', () => {
      expect(CONSTANTS.TOTAL_SUPPLY).toBe(BigInt('350000000000000000000000'))
    })

    it('should have reasonable default values', () => {
      expect(CONSTANTS.DEFAULT_CLAIM_DEADLINE_DAYS).toBe(90)
      expect(CONSTANTS.DEFAULT_MIN_DEPOSIT).toBe(BigInt('1000000000')) // 1000 USDC
      expect(CONSTANTS.DEFAULT_TOKEN_PRICE).toBe(1.0)
    })

    it('should have gas limit estimates', () => {
      expect(typeof CONSTANTS.GAS_LIMITS.SNAPSHOT).toBe('bigint')
      expect(typeof CONSTANTS.GAS_LIMITS.CLAIM).toBe('bigint')
      expect(typeof CONSTANTS.GAS_LIMITS.DISTRIBUTE).toBe('bigint')
      expect(CONSTANTS.GAS_LIMITS.SNAPSHOT).toBeGreaterThan(BigInt('0'))
    })
  })
})