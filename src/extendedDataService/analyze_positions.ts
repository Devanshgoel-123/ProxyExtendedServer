import { data } from './positionSizeDaily';

// Helper to format timestamp to readable date
function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toISOString();
}

// Get all dates between start and end (inclusive)
function getAllDates(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  
  return dates;
}

// Calculate position at 08:00 for each day (no missing dates)
function findPositionsAt8AM() {
  // Sort data by time (ascending - oldest first)
  const sortedData = [...data].sort((a, b) => a.createdTime - b.createdTime);
  
  if (sortedData.length === 0) {
    return [];
  }
  
  // Track cumulative position over time
  let cumulativePosition = 0;
  const positionsOverTime: Array<{
    timestamp: number;
    datetime: string;
    position: number;
    side: string;
    qty: number;
    price: string;
    status: string;
  }> = [];

  // Process each trade
  for (const trade of sortedData) {
    if (trade.status === 'FILLED') {
      const qty = parseFloat(trade.filledQty);
      
      // BUY adds to position, SELL subtracts
      if (trade.side === 'BUY') {
        cumulativePosition -= qty;
      } else if (trade.side === 'SELL') {
        cumulativePosition += qty;
      }

      positionsOverTime.push({
        timestamp: trade.createdTime,
        datetime: formatTimestamp(trade.createdTime),
        position: cumulativePosition,
        side: trade.side,
        qty: qty,
        price: trade.averagePrice || trade.price,
        status: trade.status
      });
    }
  }

  // Get date range
  const firstDate = new Date(positionsOverTime[0].timestamp);
  const lastDate = new Date(positionsOverTime[positionsOverTime.length - 1].timestamp);
  
  // Get all dates in the range
  const allDates = getAllDates(firstDate, lastDate);
  
  // For each date, find position at 08:00 AM
  const dailyPositions: Array<{
    date: string;
    timestamp8AM: number;
    position: number;
    lastTradeTime: string | null;
    timeDiffMinutes: number | null;
  }> = [];

  for (const dateKey of allDates) {
    // Create 8 AM timestamp for this date
    const date8AM = new Date(dateKey + 'T08:00:00.000Z');
    const timestamp8AM = date8AM.getTime();
    
    // Find the last position before or at 8:00 AM on this date
    let positionAt8AM = 0;
    let lastTradeTime: string | null = null;
    let timeDiffMinutes: number | null = null;
    
    // Find the last trade before or at 8 AM
    for (let i = positionsOverTime.length - 1; i >= 0; i--) {
      if (positionsOverTime[i].timestamp <= timestamp8AM) {
        positionAt8AM = positionsOverTime[i].position;
        lastTradeTime = positionsOverTime[i].datetime;
        timeDiffMinutes = Math.round((timestamp8AM - positionsOverTime[i].timestamp) / (1000 * 60));
        break;
      }
    }
    
    dailyPositions.push({
      date: dateKey,
      timestamp8AM: timestamp8AM,
      position: positionAt8AM,
      lastTradeTime: lastTradeTime,
      timeDiffMinutes: timeDiffMinutes
    });
  }

  return dailyPositions;
}

// Run the analysis
console.log('\n=== Positions at 08:00 AM UTC for Each Day (No Missing Dates) ===\n');

export const positions8AM = findPositionsAt8AM();

positions8AM.forEach((pos, idx) => {
  console.log(`Day ${idx + 1}: ${pos.date} 08:00 AM UTC`);
  console.log(`  Position: ${pos.position.toFixed(8)} BTC`);
  if (pos.lastTradeTime) {
    console.log(`  Last trade before 8 AM: ${pos.lastTradeTime}`);
    console.log(`  Time since last trade: ${pos.timeDiffMinutes} minutes`);
  } else {
    console.log(`  No trades before 8 AM on this date`);
  }
  console.log('');
});

console.log('\n=== Summary ===');
console.log(`Total days: ${positions8AM.length}`);
console.log(`Date range: ${positions8AM[0]?.date} to ${positions8AM[positions8AM.length - 1]?.date}`);
console.log(`Days with no position change: ${positions8AM.filter(p => p.lastTradeTime === null).length}`);
