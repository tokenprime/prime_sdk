/**
 * Contract ABIs for ENR1M Power Plant Tokenization Platform
 * Auto-generated from Foundry compilation artifacts
 */

// For simplicity in this demo, we'll use minimal ABIs
// In production, you'd import the full ABIs from the JSON files

// ENR1M Token ABI (minimal for demo)
export const ENR1M_TOKEN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'balanceOfAt',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'snapshotId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSupplyAt',
    inputs: [{ name: 'snapshotId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'eligibleSupplyAt',
    inputs: [{ name: 'snapshotId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'snapshot',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  }
] as const

// Distributor ABI (minimal for demo)
export const DISTRIBUTOR_ABI = [
  {
    type: 'function',
    name: 'claimable',
    inputs: [
      { name: 'snapshotId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getDistributionInfo',
    inputs: [{ name: 'snapshotId', type: 'uint256' }],
    outputs: [
      { name: 'totalAmount', type: 'uint256' },
      { name: 'claimedAmount', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'deadlineAt', type: 'uint256' },
      { name: 'isActive', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'claimed',
    inputs: [
      { name: 'snapshotId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'claim',
    inputs: [{ name: 'snapshotId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'claimMultiple',
    inputs: [{ name: 'snapshotIds', type: 'uint256[]' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'distribute',
    inputs: [
      { name: 'snapshotId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const

// Revenue Vault ABI (minimal for demo)
export const REVENUE_VAULT_ABI = [
  {
    type: 'function',
    name: 'balance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalReceived',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalDistributed',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'fundDistribution',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const

// Token Sale ABI (minimal for demo)
export const TOKEN_SALE_ABI = [
  {
    type: 'function',
    name: 'saleActive',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'pricePerToken',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSold',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalRaised',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'availableTokens',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'buyTokens',
    inputs: [{ name: 'tokenAmount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const

// Mock USDC ABI (ERC20 interface)
export const MOCK_USDC_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const