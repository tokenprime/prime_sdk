/**
 * Tests for ENR1MClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ENR1MClient, createENR1MClient, SUPPORTED_CHAINS } from '../index'
import type { ContractConfig } from '../types/contracts'

// Mock Viem functions
vi.mock('viem', () => ({
  getContract: vi.fn(() => ({
    read: {
      balanceOf: vi.fn(() => Promise.resolve(BigInt('1000000000000000000000'))), // 1000 tokens
      balanceOfAt: vi.fn(() => Promise.resolve(BigInt('1000000000000000000000'))),
      totalSupplyAt: vi.fn(() => Promise.resolve(BigInt('350000000000000000000000'))), // 350k tokens
      eligibleSupplyAt: vi.fn(() => Promise.resolve(BigInt('315000000000000000000000'))), // 315k eligible
      claimable: vi.fn(() => Promise.resolve(BigInt('100000000'))), // 100 USDC (6 decimals)
      getDistributionInfo: vi.fn(() => Promise.resolve([
        BigInt('15000000000'), // totalAmount - 15k USDC
        BigInt('5000000000'),  // claimedAmount - 5k USDC
        BigInt('1697472000'),  // createdAt
        BigInt('1705248000'),  // deadlineAt
        true                   // isActive
      ])),
      claimed: vi.fn(() => Promise.resolve(false)),
      hasRole: vi.fn(() => Promise.resolve(true))
    },
    write: {
      snapshot: vi.fn(() => Promise.resolve('0x123hash')),
      claim: vi.fn(() => Promise.resolve('0x456hash')),
      distribute: vi.fn(() => Promise.resolve('0x789hash')),
      deposit: vi.fn(() => Promise.resolve('0xabchash')),
      fundDistribution: vi.fn(() => Promise.resolve('0xdefhash')),
      approve: vi.fn(() => Promise.resolve('0x111hash'))
    }
  })),
  createPublicClient: vi.fn(() => ({
    waitForTransactionReceipt: vi.fn(() => Promise.resolve({
      blockNumber: BigInt('18000000'),
      transactionHash: '0x123hash'
    }))
  })),
  formatEther: vi.fn((value) => {
    // Simple mock implementation
    const decimals = 18
    const divisor = 10n ** BigInt(decimals)
    const whole = value / divisor
    return whole.toString()
  }),
  parseEther: vi.fn((value) => {
    // Simple mock implementation
    const decimals = 18
    return BigInt(parseFloat(value) * Math.pow(10, decimals))
  }),
  formatUnits: vi.fn((value, decimals) => {
    const divisor = 10n ** BigInt(decimals)
    const whole = value / divisor
    return whole.toString()
  }),
  parseUnits: vi.fn((value, decimals) => {
    return BigInt(parseFloat(value) * Math.pow(10, decimals))
  }),
  http: vi.fn()
}))

// Mock helper functions
vi.mock('../utils/helpers', () => ({
  getChainConfig: vi.fn(() => ({
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    contracts: {
      token: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      distributor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      revenueVault: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  })),
  getViemChain: vi.fn(() => ({
    id: 31337,
    name: 'Localhost',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } }
  }))
}))

describe('ENR1MClient', () => {
  let client: ENR1MClient
  let mockConfig: ContractConfig

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    mockConfig = {
      addresses: {
        token: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        distributor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        revenueVault: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      },
      publicClient: {} as any
    }

    client = new ENR1MClient(mockConfig)
  })

  describe('Constructor', () => {
    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(ENR1MClient)
      expect(client.getAddresses()).toEqual(mockConfig.addresses)
    })
  })

  describe('Token Operations', () => {
    it('should get token balance', async () => {
      const address = '0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f'
      const balance = await client.getTokenBalance(address)
      
      expect(balance).toBe(BigInt('1000000000000000000000'))
    })

    it('should get token balance at snapshot', async () => {
      const address = '0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f'
      const snapshotId = BigInt('1')
      const balance = await client.getTokenBalanceAtSnapshot(address, snapshotId)
      
      expect(balance).toBe(BigInt('1000000000000000000000'))
    })

    it('should get total supply at snapshot', async () => {
      const snapshotId = BigInt('1')
      const totalSupply = await client.getTotalSupplyAtSnapshot(snapshotId)
      
      expect(totalSupply).toBe(BigInt('350000000000000000000000'))
    })

    it('should get eligible supply at snapshot', async () => {
      const snapshotId = BigInt('1')
      const eligibleSupply = await client.getEligibleSupplyAtSnapshot(snapshotId)
      
      expect(eligibleSupply).toBe(BigInt('315000000000000000000000'))
    })
  })

  describe('Distribution Operations', () => {
    it('should get claimable amount', async () => {
      const address = '0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f'
      const snapshotId = BigInt('1')
      const claimable = await client.getClaimableAmount(address, snapshotId)
      
      expect(claimable).toBe(BigInt('100000000'))
    })

    it('should get distribution info', async () => {
      const snapshotId = BigInt('1')
      const info = await client.getDistributionInfo(snapshotId)
      
      expect(info).toEqual({
        totalAmount: BigInt('15000000000'),
        claimedAmount: BigInt('5000000000'),
        createdAt: BigInt('1697472000'),
        deadlineAt: BigInt('1705248000'),
        isActive: true
      })
    })

    it('should get user info', async () => {
      const address = '0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f'
      const snapshotId = BigInt('1')
      const userInfo = await client.getUserInfo(address, snapshotId)
      
      expect(userInfo).toEqual({
        balance: BigInt('1000000000000000000000'),
        balanceAtSnapshot: BigInt('1000000000000000000000'),
        claimableAmount: BigInt('100000000'),
        hasClaimed: false
      })
    })
  })

  describe('Utility Methods', () => {
    it('should format token amounts', () => {
      const amount = BigInt('1000000000000000000000') // 1000 tokens
      const formatted = client.formatTokenAmount(amount)
      
      expect(formatted).toBe('1000')
    })

    it('should parse token amounts', () => {
      const amount = '1000.5'
      const parsed = client.parseTokenAmount(amount)
      
      expect(parsed).toBe(BigInt('1000500000000000000000'))
    })

    it('should format USDC amounts', () => {
      const amount = BigInt('1000500000') // 1000.5 USDC
      const formatted = client.formatUSDCAmount(amount)
      
      expect(formatted).toBe('1000')
    })

    it('should parse USDC amounts', () => {
      const amount = '1000.25'
      const parsed = client.parseUSDCAmount(amount)
      
      expect(parsed).toBe(BigInt('1000250000'))
    })

    it('should get contract addresses', () => {
      const addresses = client.getAddresses()
      
      expect(addresses).toEqual(mockConfig.addresses)
    })

    it('should check user roles', async () => {
      const role = 'ADMIN_ROLE'
      const address = '0x742d35Cc6634C0532925a3b8D84Eb5b4FA4FcD3f'
      const hasRole = await client.hasRole(role, address)
      
      expect(hasRole).toBe(true)
    })
  })
})

describe('createENR1MClient', () => {
  it('should create client with factory function', () => {
    const client = createENR1MClient({
      chainId: SUPPORTED_CHAINS.LOCALHOST,
      rpcUrl: 'http://127.0.0.1:8545'
    })
    
    expect(client).toBeInstanceOf(ENR1MClient)
  })

  it('should create client with custom addresses', () => {
    const customAddresses = {
      token: '0x1234567890123456789012345678901234567890'
    }
    
    const client = createENR1MClient({
      chainId: SUPPORTED_CHAINS.LOCALHOST,
      addresses: customAddresses
    })
    
    expect(client.getAddresses().token).toBe(customAddresses.token)
  })
})