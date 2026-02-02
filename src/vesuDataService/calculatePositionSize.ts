import { getBlockNumber, readPositionFromVesu } from './getData.js';
import { VesuAdapterConfig, ContractAddr, TokenInfo } from '@strkfarm/sdk';
import { Global } from '@strkfarm/sdk';
// Define common token addresses for Starknet mainnet
const TOKENS = Global.getDefaultTokens();

// Vesu pool configurations
export const VesuPools = {
  Genesis: ContractAddr.from('0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28'),
  Re7xSTRK: ContractAddr.from('0x052fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161'),
  Re7xBTC: ContractAddr.from('0x3a8416bf20d036df5b1cf3447630a2e1cb04685f6b0c3a70ed7fb1473548ecf'),
  Re7USDCPrime: ContractAddr.from('0x02eef0c13b10b487ea5916b54c0a7f98ec43fb3048f60fdeedaf5b08f6f88aaf'),
}

// Vault allocator address from vesu-extended-strategy
const VAULT_ALLOCATOR = ContractAddr.from('0x07d533c838eab6a4d854dd3aea96a55993fccd35821921970d00bde946b63b6f');

/**
 * Get timestamp for 8am UTC on a specific date
 * @param dateString Date in format 'YYYY-MM-DD'
 * @returns Unix timestamp in milliseconds
 */
function get8amUTCTimestamp(dateString: string): number {
  const date = new Date(dateString + 'T08:00:00Z');
  return date.getTime();
}

/**
 * Calculate position size for a specific Vesu configuration at a given date
 */
export async function calculatePositionSizeAt8am(
  collateralToken: TokenInfo,
  debtToken: TokenInfo,
  poolId: ContractAddr,
  vaultAllocator: ContractAddr,
  dateString: string
) {
  console.log(`\n=== Calculating Position Size for ${dateString} at 8am UTC ===`);
  
  try {
    // Get timestamp for 8am UTC
    const timestamp = get8amUTCTimestamp(dateString);
    console.log(`Timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`);
    
    // Get block number at that timestamp
    console.log('Fetching block number...');
    const blockResponse = await getBlockNumber(timestamp);
    
    if (!blockResponse.success) {
      console.error('Failed to get block number:', blockResponse.message);
      return null;
    }
    
    const blockNumber = blockResponse.data;
    console.log(`Block number: ${blockNumber}`);
    
    // Create Vesu config
    const config: VesuAdapterConfig = {
      poolId,
      collateral: collateralToken,
      debt: debtToken,
      vaultAllocator,
      id: `${collateralToken.symbol}-${debtToken.symbol}`
    };
    
    // Read position from Vesu
    console.log(`Reading position (${config.id})...`);
    const positionResult = await readPositionFromVesu(config, blockNumber);
    
    if (!positionResult.success) {
      console.error('Failed to read position:', positionResult.message);
      if (positionResult.error) {
        console.error('Error details:', positionResult.error);
      }
      return null;
    }
    
    console.log('Position data:');
    console.log(`  Collateral (${collateralToken.symbol}): ${positionResult.data?.collateral}`);
    console.log(`  Debt (${debtToken.symbol}): ${positionResult.data?.debt}`);
    
    return {
      date: dateString,
      timestamp,
      blockNumber,
      collateral: {
        token: collateralToken.symbol,
        amount: positionResult.data?.collateral
      },
      debt: {
        token: debtToken.symbol,
        amount: positionResult.data?.debt
      }
    };
    
  } catch (error) {
    console.error('Error calculating position size:', error);
    return null;
  }
}

/**
 * Calculate position sizes for multiple dates
 */
export async function calculatePositionSizesForDates(
  collateralToken: TokenInfo,
  debtToken: TokenInfo,
  poolId: ContractAddr,
  vaultAllocator: ContractAddr,
  dates: string[]
) {
  console.log(`\n======================================`);
  console.log(`Position Size Calculator`);
  console.log(`Pair: ${collateralToken.symbol}/${debtToken.symbol}`);
  console.log(`Pool ID: ${poolId.address}`);
  console.log(`======================================`);
  
  const results = [];
  
  for (const date of dates) {
    const result = await calculatePositionSizeAt8am(
      collateralToken,
      debtToken,
      poolId,
      vaultAllocator,
      date
    );
    
    if (result) {
      results.push(result);
    }
    
    // Add small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Example usage
export async function main() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  console.log('Calculating position sizes for dates:', dates);
  
  // Example configuration - adjust as needed
  const wbtcToken = TOKENS.find(token => token.symbol === 'WBTC');
  const usdcToken = TOKENS.find(token => token.symbol === 'USDC');
  if (!wbtcToken || !usdcToken) {
    console.error('WBTC or USDC token not found');
    return;
  }
  const results = await calculatePositionSizesForDates(
    wbtcToken,
    usdcToken,
    VesuPools.Re7USDCPrime,
    VAULT_ALLOCATOR,
    dates
  );
  
  console.log('\n======================================');
  console.log('Summary:');
  console.log('======================================');
  console.log(JSON.stringify(results, null, 2));
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
