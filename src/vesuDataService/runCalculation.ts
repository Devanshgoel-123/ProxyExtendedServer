import { calculatePositionSizesForDates } from './calculatePositionSize.js';
import { ContractAddr} from '@strkfarm/sdk';
import { Global } from '@strkfarm/sdk';



// Vesu pool configurations
export const VesuPools = {
  Genesis: ContractAddr.from('0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28'),
  Re7xSTRK: ContractAddr.from('0x052fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161'),
  Re7xBTC: ContractAddr.from('0x3a8416bf20d036df5b1cf3447630a2e1cb04685f6b0c3a70ed7fb1473548ecf'),
  Re7USDCPrime: ContractAddr.from('0x02eef0c13b10b487ea5916b54c0a7f98ec43fb3048f60fdeedaf5b08f6f88aaf'),
}

// Vault allocator address from vesu-extended-strategy
const VAULT_ALLOCATOR = ContractAddr.from('0x07d533c838eab6a4d854dd3aea96a55993fccd35821921970d00bde946b63b6f');


async function run() {
  console.log('======================================');
  console.log('Vesu Position Size Calculator');
  console.log('======================================\n');
  const TOKENS = Global.getDefaultTokens();
  // Get dates for the last 7 days at 8am UTC
  let dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  console.log('Dates to calculate:', dates);
  console.log('\n');

  // Example 1: ETH/USDC position
  const wbtcToken = TOKENS.find(token => token.symbol === 'WBTC');
  const usdcToken = TOKENS.find(token => token.symbol === 'USDC');
  if (!wbtcToken || !usdcToken) {
    console.error('WBTC or USDC token not found');
    return;
  }
  console.log('\n📊 Calculating ETH/USDC positions...\n');
  const ethUsdcResults = await calculatePositionSizesForDates(
    wbtcToken,
    usdcToken,
    VesuPools.Re7USDCPrime,
    VAULT_ALLOCATOR,
    dates
  );

  // Print summary
  console.log('\n======================================');
  console.log('📈 RESULTS SUMMARY');
  console.log('======================================\n');
  
  console.log('ETH/USDC Positions:');
  console.table(ethUsdcResults.map(r => ({
    Date: r.date,
    'Block Number': r.blockNumber,
    'Collateral (ETH)': r.collateral.amount,
    'Debt (USDC)': r.debt.amount
  })));

  // Save to file
  const fs = require('fs');
  const output = {
    generated_at: new Date().toISOString(),
    positions: {
      'ETH-USDC': ethUsdcResults
    }
  };
  
  const outputPath = './vesu_positions_8am.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);
}

// Run the script
run().catch(error => {
  console.error('❌ Error running calculation:', error);
  process.exit(1);
});
