# Prime SDK

<div align="center">
  <img src="https://raw.githubusercontent.com/tokenprime/prime_sdk/main/assets/logo-prime.png" alt="Prime SDK Logo" width="150" height="150">
</div>

[![npm version](https://badge.fury.io/js/@prime%2Fsdk.svg)](https://badge.fury.io/js/@prime%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5%2B-blue)](https://www.typescriptlang.org/)
[![Viem](https://img.shields.io/badge/Viem-2.21%2B-green)](https://viem.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, type-safe TypeScript SDK for interacting with ENR1M Power Plant Tokenization Platform. Built with [Viem](https://viem.sh/) and [ABIType](https://abitype.dev/) for maximum type safety and developer experience.

## 🌟 Features

- **🔒 Type-Safe**: Full TypeScript support with automatic ABI type inference
- **⚡ Modern Stack**: Built on Viem + ABIType (recommended by TypeChain creator)
- **🏗️ Complete Workflow**: Supports entire power plant tokenization lifecycle
- **📊 Real-time Data**: Query balances, distributions, and system status
- **💰 Profit Distribution**: Claim individual or batch profit distributions
- **🛠️ Operator Tools**: Complete monthly operations workflow
- **🌐 Multi-Chain**: Support for Polygon, Mumbai, localhost, and Energy Web Chain
- **📚 Well Documented**: Comprehensive examples and API documentation

## 🚀 Quick Start

### Installation

```bash
npm install @prime/sdk viem
# or
yarn add @prime/sdk viem
# or
pnpm add @prime/sdk viem
```

### Basic Usage

```typescript
import { createENR1MClient, SUPPORTED_CHAINS } from '@prime/sdk'

// Create client (read-only)
const client = createENR1MClient({
  chainId: SUPPORTED_CHAINS.POLYGON, // or MUMBAI, LOCALHOST
  rpcUrl: 'https://polygon-rpc.com' // optional
})

// Get user token balance
const balance = await client.getTokenBalance('0x...')
console.log(`Balance: ${client.formatTokenAmount(balance)} ENR1M`)

// Get claimable profits
const claimable = await client.getClaimableAmount('0x...', 1n) // snapshot ID 1
console.log(`Claimable: ${client.formatUSDCAmount(claimable)} USDC`)
```

### With Wallet (for transactions)

```typescript
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'

const account = privateKeyToAccount('0x...')
const walletClient = createWalletClient({
  account,
  chain: polygon,
  transport: http()
})

const client = createENR1MClient({
  chainId: SUPPORTED_CHAINS.POLYGON,
  walletClient
})

// Claim profits
const result = await client.claim(1n) // snapshot ID 1
console.log(`Claimed: ${client.formatUSDCAmount(result.amount)} USDC`)
```

## 📖 Core Concepts

### Power Plant Tokenization

ENR1M represents a tokenized 1MW power plant where:
- **350,000 ENR1M tokens** = 1MW power plant capacity
- **Monthly revenue** from electricity sales is distributed to token holders
- **Snapshot mechanism** prevents last-minute buying before distributions
- **90-day claim period** for each distribution

### Monthly Workflow

1. **Day 25**: Create snapshot (Record Date)
2. **Day 26**: Deposit revenue → Fund distributor → Create distribution
3. **Day 27+**: Token holders claim their share
4. **Day 90+**: Unclaimed funds returned to treasury

## 🏗️ Architecture

The system consists of four main contracts:

- **ENR1MToken**: ERC20 token with snapshot capability
- **RevenueVault**: Collects and manages revenue
- **Distributor**: Handles profit distribution and claims
- **TokenSale**: Initial token sale (optional)

## 📚 API Reference

### Client Setup

```typescript
import { ENR1MClient, createENR1MClient } from '@prime/sdk'

// Factory function (recommended)
const client = createENR1MClient({
  chainId: SUPPORTED_CHAINS.POLYGON,
  rpcUrl?: string,
  addresses?: Partial<ContractAddresses>,
  walletClient?: WalletClient
})

// Manual setup
const client = new ENR1MClient({
  addresses: {
    token: '0x...',
    distributor: '0x...',
    revenueVault: '0x...',
    usdc: '0x...'
  },
  publicClient,
  walletClient?
})
```

### Reading Data

```typescript
// Token information
const balance = await client.getTokenBalance(address)
const balanceAtSnapshot = await client.getTokenBalanceAtSnapshot(address, snapshotId)
const totalSupply = await client.getTotalSupplyAtSnapshot(snapshotId)
const eligibleSupply = await client.getEligibleSupplyAtSnapshot(snapshotId)

// Distribution information
const claimableAmount = await client.getClaimableAmount(address, snapshotId)
const distributionInfo = await client.getDistributionInfo(snapshotId)
const userInfo = await client.getUserInfo(address, snapshotId)

// System status
const status = await client.getSystemStatus()
```

### User Operations

```typescript
// Claim profits (requires wallet)
const claimResult = await client.claim(snapshotId)

// Batch claim multiple snapshots
const claimResults = await client.claimMultiple([1n, 2n, 3n])
```

### Operator Operations

```typescript
// Create snapshot (OPERATOR role required)
const snapshot = await client.createSnapshot()

// Monthly workflow (OPERATOR role required)
const result = await client.executeMonthlyOperation({
  monthlyRevenue: client.parseUSDCAmount('15000') // $15,000
})

// Individual steps
await client.depositRevenue(amount)
await client.fundDistribution(amount)
await client.createDistribution(snapshotId, amount)
```

### Utility Functions

```typescript
// Amount formatting
const formatted = client.formatTokenAmount(balance) // "1000.5"
const parsed = client.parseTokenAmount("1000.5")   // BigInt

const formattedUSDC = client.formatUSDCAmount(amount) // "15000.25"
const parsedUSDC = client.parseUSDCAmount("15000.25") // BigInt

// Calculations
import { calculateUserShare, calculateAPY } from '@prime/sdk'

const userShare = calculateUserShare(userBalance, totalDistribution, eligibleSupply)
const apy = calculateAPY(monthlyDistribution, userBalance, eligibleSupply)

// Time helpers
import { getRecordDate, getDistributionDate, getClaimDeadline } from '@prime/sdk'

const recordDate = getRecordDate(2024, 10) // October 25, 2024
const distributionDate = getDistributionDate(2024, 10) // October 26, 2024
const deadline = getClaimDeadline(distributionDate, 90) // 90 days later
```

## 🌐 Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Polygon Mainnet | 137 | ✅ Ready |
| Polygon Mumbai | 80001 | ✅ Testnet |
| Localhost | 31337 | ✅ Development |
| Energy Web Chain | 246 | 🚧 Planned |

### Network Configuration

```typescript
import { CHAIN_CONFIGS, getChainConfig } from '@prime/sdk'

const config = getChainConfig(SUPPORTED_CHAINS.POLYGON)
console.log(config.contracts.token) // Token contract address
```

## 🔧 Development

### Building the SDK

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run build:watch

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Testing

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

## 📋 Examples

Check out the [examples](./src/examples/) directory for comprehensive usage examples:

- **[Basic Usage](./src/examples/basic-usage.ts)**: Client setup, reading data, claiming profits
- **[Monthly Operations](./src/examples/basic-usage.ts)**: Complete OPERATOR workflow
- **[Utility Functions](./src/examples/basic-usage.ts)**: Formatting, calculations, time helpers

### Running Examples

```bash
# Install dependencies
cd sdk
npm install

# Run basic examples
npm run dev
```

## 🚨 Error Handling

The SDK provides typed error classes for better error handling:

```typescript
import { 
  ENR1MSDKError,
  ContractInteractionError,
  InsufficientBalanceError,
  InvalidSnapshotError,
  ClaimDeadlinePassedError
} from '@prime/sdk'

try {
  await client.claim(snapshotId)
} catch (error) {
  if (error instanceof ClaimDeadlinePassedError) {
    console.log(`Claim deadline passed: ${error.deadline}`)
  } else if (error instanceof InsufficientBalanceError) {
    console.log(`Need ${error.required}, have ${error.available}`)
  } else if (error instanceof ContractInteractionError) {
    console.log(`Contract error in ${error.contractName}.${error.functionName}`)
  }
}
```

## 🔐 Security

- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Input Validation**: All parameters are validated before contract calls
- **Error Handling**: Comprehensive error types for better debugging
- **No Private Keys**: SDK never stores or logs private keys
- **Read-Only by Default**: Write operations require explicit wallet client

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- **Documentation**: [docs.enr1m.com](https://docs.enr1m.com)
- **GitHub**: [github.com/enr1m/power-contract](https://github.com/enr1m/power-contract)
- **NPM**: [@prime/sdk](https://www.npmjs.com/package/@prime/sdk)
- **Website**: [enr1m.com](https://enr1m.com)

## ⚡ Built with

- [Viem](https://viem.sh/) - TypeScript Interface for Ethereum
- [ABIType](https://abitype.dev/) - Strict TypeScript types for ABIs
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Foundry](https://getfoundry.sh/) - Smart contract development

---

**Made with ❤️ for decentralized energy** by the ENR1M team