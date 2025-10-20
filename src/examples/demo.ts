#!/usr/bin/env ts-node

/**
 * ENR1M SDK Demo - Basic functionality demonstration
 * This demo shows the SDK capabilities without requiring blockchain connection
 */

import { 
  createENR1MClient, 
  SUPPORTED_CHAINS, 
  formatTokenDisplay,
  formatUSDCDisplay,
  calculateUserShare,
  calculateAPY,
  getRecordDate,
  getDistributionDate,
  getClaimDeadline
} from '../index'

console.log('🌟 ENR1M SDK Demo')
console.log('=================\n')

// Demo 1: Client Setup
console.log('1️⃣ Setting up SDK Client...')
try {
  const client = createENR1MClient({
    chainId: SUPPORTED_CHAINS.LOCALHOST,
    rpcUrl: 'http://127.0.0.1:8545'
  })
  
  console.log('✅ Client created successfully!')
  console.log('📍 Contract Addresses:')
  const addresses = client.getAddresses()
  console.log(`   Token: ${addresses.token}`)
  console.log(`   Distributor: ${addresses.distributor}`)
  console.log(`   Vault: ${addresses.revenueVault}`)
  console.log(`   USDC: ${addresses.usdc}`)
  
} catch (error) {
  console.log('ℹ️ Client setup demo (contracts may not be deployed on localhost)')
}

console.log('\n2️⃣ Utility Functions Demo...')

// Demo 2: Amount Formatting
const tokenAmount = BigInt('5000000000000000000000') // 5,000 ENR1M tokens
const usdcAmount = BigInt('15000250000') // $15,000.25 USDC

console.log('💰 Amount Formatting:')
console.log(`   ${formatTokenDisplay(tokenAmount)} ENR1M`)
console.log(`   $${formatUSDCDisplay(usdcAmount)} USDC`)

// Demo 3: Calculations
console.log('\n📊 Calculation Examples:')
const userBalance = BigInt('10000000000000000000000') // 10,000 ENR1M
const totalDistribution = BigInt('15000000000') // $15,000 USDC
const eligibleSupply = BigInt('315000000000000000000000') // 315,000 eligible tokens

const userShare = calculateUserShare(userBalance, totalDistribution, eligibleSupply)
console.log(`   User with ${formatTokenDisplay(userBalance)} ENR1M tokens`)
console.log(`   Share of $${formatUSDCDisplay(totalDistribution)} distribution: $${formatUSDCDisplay(userShare)}`)

const apy = calculateAPY(totalDistribution, userBalance, eligibleSupply)
console.log(`   Estimated APY: ${apy.toFixed(2)}%`)

// Demo 4: Time Helpers
console.log('\n📅 Monthly Operation Schedule:')
const recordDate = getRecordDate(2024, 10) // October 2024
const distributionDate = getDistributionDate(2024, 10)
const claimDeadline = getClaimDeadline(distributionDate, 90)

console.log(`   Record Date (Snapshot): ${recordDate.toDateString()}`)
console.log(`   Distribution Date: ${distributionDate.toDateString()}`)
console.log(`   Claim Deadline: ${claimDeadline.toDateString()}`)

// Demo 5: SDK Configuration
console.log('\n⚙️ SDK Configuration:')
console.log(`   Supported Networks: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`)
console.log(`   Built with: Viem + ABIType`)
console.log(`   Type-safe: ✅`)
console.log(`   Tree-shakeable: ✅`)

console.log('\n🎉 Demo completed successfully!')
console.log('\n📚 Next Steps:')
console.log('   1. Deploy contracts to localhost: make deploy-local')
console.log('   2. Run integration tests: npm test')
console.log('   3. Try live examples with real contracts')
console.log('   4. Check out the documentation in README.md')

process.exit(0)