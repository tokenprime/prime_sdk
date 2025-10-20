/**
 * Basic Usage Examples for ENR1M SDK
 * Demonstrates common operations and workflows
 */

// For now, we'll create a simplified example that doesn't require actual blockchain connection
import { ENR1MClient, createENR1MClient, SUPPORTED_CHAINS } from '../index'

// Example 1: Setting up the client
async function setupClient() {
  console.log('🚀 Setting up ENR1M SDK Client...')
  
  try {
    // Using factory function (recommended)
    const client = createENR1MClient({
      chainId: SUPPORTED_CHAINS.LOCALHOST, // or POLYGON, MUMBAI
      rpcUrl: 'http://127.0.0.1:8545' // optional, uses default if not provided
    })
    
    console.log('✅ Client setup complete!')
    console.log(`📍 Contract addresses:`)
    console.log(`  Token: ${client.getAddresses().token}`)
    console.log(`  Distributor: ${client.getAddresses().distributor}`)
    console.log(`  Vault: ${client.getAddresses().revenueVault}`)
    console.log(`  USDC: ${client.getAddresses().usdc}`)
    
    return client
  } catch (error) {
    console.error('❌ Error setting up client:', error)
    throw error
  }
}

// Example 2: Reading user information
async function getUserInformation() {
  console.log('📊 Reading user information...')
  
  const client = await setupClient()
  const userAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Example address
  
  try {
    // Get current token balance
    const balance = await client.getTokenBalance(userAddress)
    console.log(`Current ENR1M balance: ${client.formatTokenAmount(balance)} ENR1M`)
    
    // Get user info for latest snapshot (assuming snapshot ID 1 exists)
    const snapshotId = 1n
    const userInfo = await client.getUserInfo(userAddress, snapshotId)
    
    console.log(`Balance at snapshot ${snapshotId}: ${client.formatTokenAmount(userInfo.balanceAtSnapshot)} ENR1M`)
    console.log(`Claimable amount: ${client.formatUSDCAmount(userInfo.claimableAmount)} USDC`)
    console.log(`Has claimed: ${userInfo.hasClaimed}`)
    
    // Get distribution info
    const distributionInfo = await client.getDistributionInfo(snapshotId)
    console.log(`Distribution total: ${client.formatUSDCAmount(distributionInfo.totalAmount)} USDC`)
    console.log(`Distribution claimed: ${client.formatUSDCAmount(distributionInfo.claimedAmount)} USDC`)
    console.log(`Distribution active: ${distributionInfo.isActive}`)
    
  } catch (error) {
    console.error('❌ Error reading user information:', error)
  }
}

// Example 3: Claiming profits
async function claimProfits() {
  console.log('💰 Claiming profits...')
  
  // Setup client with wallet for write operations
  const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
  
  const walletClient = createWalletClient({
    account,
    chain: { id: 31337, name: 'Localhost', network: 'localhost', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, public: { http: ['http://127.0.0.1:8545'] } } },
    transport: http('http://127.0.0.1:8545')
  })
  
  const client = createENR1MClient({
    chainId: SUPPORTED_CHAINS.LOCALHOST,
    walletClient
  })
  
  try {
    const snapshotId = 1n
    
    // Check claimable amount first
    const claimableAmount = await client.getClaimableAmount(account.address, snapshotId)
    console.log(`Claimable amount: ${client.formatUSDCAmount(claimableAmount)} USDC`)
    
    if (claimableAmount > 0n) {
      // Claim for single snapshot
      const result = await client.claim(snapshotId)
      console.log(`✅ Claimed ${client.formatUSDCAmount(result.amount)} USDC`)
      console.log(`Transaction hash: ${result.transactionHash}`)
    } else {
      console.log('ℹ️ Nothing to claim for this snapshot')
    }
    
  } catch (error) {
    console.error('❌ Error claiming profits:', error)
  }
}

// Example 4: Batch claiming multiple snapshots
async function batchClaimProfits() {
  console.log('💰 Batch claiming profits...')
  
  const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
  
  const walletClient = createWalletClient({
    account,
    chain: { id: 31337, name: 'Localhost', network: 'localhost', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, public: { http: ['http://127.0.0.1:8545'] } } },
    transport: http('http://127.0.0.1:8545')
  })
  
  const client = createENR1MClient({
    chainId: SUPPORTED_CHAINS.LOCALHOST,
    walletClient
  })
  
  try {
    const snapshotIds = [1n, 2n, 3n] // Example snapshot IDs
    
    // Check claimable amounts
    for (const snapshotId of snapshotIds) {
      const claimableAmount = await client.getClaimableAmount(account.address, snapshotId)
      console.log(`Snapshot ${snapshotId}: ${client.formatUSDCAmount(claimableAmount)} USDC claimable`)
    }
    
    // Batch claim
    const results = await client.claimMultiple(snapshotIds)
    
    let totalClaimed = 0n
    results.forEach(result => {
      console.log(`✅ Snapshot ${result.snapshotId}: Claimed ${client.formatUSDCAmount(result.amount)} USDC`)
      totalClaimed += result.amount
    })
    
    console.log(`🎉 Total claimed: ${client.formatUSDCAmount(totalClaimed)} USDC`)
    
  } catch (error) {
    console.error('❌ Error batch claiming:', error)
  }
}

// Example 5: Monthly operations workflow (OPERATOR role required)
async function monthlyOperationsWorkflow() {
  console.log('📅 Executing monthly operations workflow...')
  
  // This example assumes you have OPERATOR role
  const operatorAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
  
  const walletClient = createWalletClient({
    account: operatorAccount,
    chain: { id: 31337, name: 'Localhost', network: 'localhost', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, public: { http: ['http://127.0.0.1:8545'] } } },
    transport: http('http://127.0.0.1:8545')
  })
  
  const client = createENR1MClient({
    chainId: SUPPORTED_CHAINS.LOCALHOST,
    walletClient
  })
  
  try {
    // Step 1: Create snapshot (Record Date - typically 25th of month)
    console.log('📸 Creating monthly snapshot...')
    const snapshot = await client.createSnapshot()
    console.log(`✅ Snapshot created with ID: ${snapshot.snapshotId}`)
    console.log(`Total supply: ${client.formatTokenAmount(snapshot.totalSupply)} ENR1M`)
    console.log(`Eligible supply: ${client.formatTokenAmount(snapshot.eligibleSupply)} ENR1M`)
    
    // Step 2-4: Execute complete monthly workflow
    const monthlyRevenue = client.parseUSDCAmount('15000') // $15,000 monthly revenue
    console.log(`💰 Processing monthly revenue: ${client.formatUSDCAmount(monthlyRevenue)} USDC`)
    
    const result = await client.executeMonthlyOperation({
      monthlyRevenue,
      snapshotId: snapshot.snapshotId
    })
    
    console.log(`✅ Monthly operation complete!`)
    console.log(`Distribution created for ${client.formatUSDCAmount(result.distribution.amount)} USDC`)
    
  } catch (error) {
    console.error('❌ Error in monthly operations:', error)
  }
}

// Example 6: System monitoring and status
async function monitorSystemStatus() {
  console.log('📊 Monitoring system status...')
  
  const client = await setupClient()
  
  try {
    const status = await client.getSystemStatus()
    
    console.log('=== ENR1M System Status ===')
    console.log(`Token Total Supply: ${client.formatTokenAmount(status.token.totalSupply)} ENR1M`)
    console.log(`Token Paused: ${status.token.paused}`)
    
    console.log(`Vault Balance: ${client.formatUSDCAmount(status.vault.balance)} USDC`)
    console.log(`Vault Total Received: ${client.formatUSDCAmount(status.vault.totalReceived)} USDC`)
    console.log(`Vault Total Distributed: ${client.formatUSDCAmount(status.vault.totalDistributed)} USDC`)
    console.log(`Vault Paused: ${status.vault.paused}`)
    
    console.log(`Distributor Balance: ${client.formatUSDCAmount(status.distributor.balance)} USDC`)
    console.log(`Claim Deadline: ${status.distributor.claimDeadlineDays} days`)
    console.log(`Distributor Paused: ${status.distributor.paused}`)
    
    if (status.tokenSale) {
      console.log(`Token Sale Active: ${status.tokenSale.active}`)
      console.log(`Token Price: ${client.formatUSDCAmount(status.tokenSale.pricePerToken)} USDC`)
      console.log(`Tokens Sold: ${client.formatTokenAmount(status.tokenSale.totalSold)} ENR1M`)
      console.log(`Total Raised: ${client.formatUSDCAmount(status.tokenSale.totalRaised)} USDC`)
    }
    
  } catch (error) {
    console.error('❌ Error monitoring system:', error)
  }
}

// Example 7: Utility functions demonstration
async function utilityFunctionsDemo() {
  console.log('🛠️ Demonstrating utility functions...')
  
  const client = await setupClient()
  
  // Amount formatting
  const tokenAmount = client.parseTokenAmount('1000.5') // 1000.5 ENR1M
  const usdcAmount = client.parseUSDCAmount('15000.25') // $15,000.25 USDC
  
  console.log(`Parsed token amount: ${tokenAmount.toString()} wei`)
  console.log(`Formatted token: ${client.formatTokenAmount(tokenAmount)} ENR1M`)
  console.log(`Parsed USDC amount: ${usdcAmount.toString()} wei`)
  console.log(`Formatted USDC: ${client.formatUSDCAmount(usdcAmount)} USDC`)
  
  // Calculation examples
  const userBalance = client.parseTokenAmount('5000') // 5,000 ENR1M
  const totalDistribution = usdcAmount // $15,000.25
  const eligibleSupply = client.parseTokenAmount('315000') // 315,000 eligible tokens
  
  const userShare = await import('../utils/helpers').then(h => 
    h.calculateUserShare(userBalance, totalDistribution, eligibleSupply)
  )
  console.log(`User share: ${client.formatUSDCAmount(userShare)} USDC`)
  
  const apy = await import('../utils/helpers').then(h => 
    h.calculateAPY(totalDistribution, userBalance, eligibleSupply)
  )
  console.log(`Estimated APY: ${apy.toFixed(2)}%`)
  
  // Time helpers
  const recordDate = await import('../utils/helpers').then(h => 
    h.getRecordDate(2024, 10) // October 2024
  )
  const distributionDate = await import('../utils/helpers').then(h => 
    h.getDistributionDate(2024, 10)
  )
  const claimDeadline = await import('../utils/helpers').then(h => 
    h.getClaimDeadline(distributionDate, 90)
  )
  
  console.log(`Record Date: ${recordDate.toDateString()}`)
  console.log(`Distribution Date: ${distributionDate.toDateString()}`)
  console.log(`Claim Deadline: ${claimDeadline.toDateString()}`)
}

// Main execution function
async function runExamples() {
  console.log('🎯 ENR1M SDK Examples')
  console.log('=====================\n')
  
  try {
    await setupClient()
    console.log()
    
    await getUserInformation()
    console.log()
    
    // Note: These require actual blockchain interaction
    // await claimProfits()
    // console.log()
    
    // await batchClaimProfits()
    // console.log()
    
    // await monthlyOperationsWorkflow()
    // console.log()
    
    await monitorSystemStatus()
    console.log()
    
    await utilityFunctionsDemo()
    console.log()
    
    console.log('🎉 All examples completed successfully!')
    
  } catch (error) {
    console.error('❌ Error running examples:', error)
  }
}

// Export for use in other files
export {
  setupClient,
  getUserInformation,
  claimProfits,
  batchClaimProfits,
  monthlyOperationsWorkflow,
  monitorSystemStatus,
  utilityFunctionsDemo,
  runExamples
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples()
}