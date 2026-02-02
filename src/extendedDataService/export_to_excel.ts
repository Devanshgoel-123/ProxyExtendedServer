import ExcelJS from 'exceljs';
import { positions8AM } from './analyze_positions.js';

async function exportToExcel() {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'Position Analysis';
  workbook.created = new Date();
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Daily Positions at 8 AM', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  // Define columns
  worksheet.columns = [
    { header: 'Day #', key: 'dayNum', width: 10 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Position (BTC)', key: 'position', width: 18 },
    { header: 'Last Trade Time', key: 'lastTradeTime', width: 25 },
    { header: 'Time Since Last Trade (minutes)', key: 'timeDiff', width: 30 }
  ];
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0066CC' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add data rows
  positions8AM.forEach((pos, index:number) => {
    const row = worksheet.addRow({
      dayNum: index + 1,
      date: pos.date,
      position: pos.position,
      lastTradeTime: pos.lastTradeTime || 'N/A',
      timeDiff: pos.timeDiffMinutes || 'N/A'
    });
    
    // Format position numbers
    row.getCell('position').numFmt = '0.00000000';
    
    // Color code based on position value
    if (pos.position < 0) {
      row.getCell('position').font = { color: { argb: 'FFFF0000' } }; // Red for short
    } else if (pos.position > 0) {
      row.getCell('position').font = { color: { argb: 'FF00AA00' } }; // Green for long
    }
    
    // Alternate row colors for better readability
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
  });
  
  // Add summary statistics worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  
  // Calculate statistics
  const positions = positions8AM.map((p:any) => p.position);
  const avgPosition = positions.reduce((a:number, b:number) => a + b, 0) / positions.length;
  const maxPosition = Math.max(...positions);
  const minPosition = Math.min(...positions);
  const stdDev = Math.sqrt(
    positions.reduce((sum:number, pos:number) => sum + Math.pow(pos - avgPosition, 2), 0) / positions.length
  );
  
  // Style summary header
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0066CC' }
  };
  
  // Add summary data
  const summaryData = [
    { metric: 'Total Days', value: positions8AM.length },
    { metric: 'Date Range', value: `${positions8AM[0].date} to ${positions8AM[positions8AM.length - 1].date}` },
    { metric: 'Average Position (BTC)', value: avgPosition.toFixed(8) },
    { metric: 'Maximum Position (BTC)', value: maxPosition.toFixed(8) },
    { metric: 'Minimum Position (BTC)', value: minPosition.toFixed(8) },
    { metric: 'Standard Deviation', value: stdDev.toFixed(8) },
    { metric: 'Position Type', value: avgPosition < 0 ? 'Short' : 'Long' }
  ];
  
  summaryData.forEach((data, index) => {
    const row = summarySheet.addRow(data);
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
  });
  
  // Add a chart worksheet with data for charting
  const chartDataSheet = workbook.addWorksheet('Chart Data');
  chartDataSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Position', key: 'position', width: 18 }
  ];
  
  const chartHeader = chartDataSheet.getRow(1);
  chartHeader.font = { bold: true };
  
  positions8AM.forEach((pos:any) => {
    chartDataSheet.addRow({
      date: pos.date,
      position: pos.position
    });
  });
  
  // Save the file
  const filename = 'positions_at_8am.xlsx';
  await workbook.xlsx.writeFile(filename);
  
  console.log(`\n✅ Excel file created successfully: ${filename}`);
  console.log(`\n📊 Summary Statistics:`);
  console.log(`   Total Days: ${positions8AM.length}`);
  console.log(`   Date Range: ${positions8AM[0].date} to ${positions8AM[positions8AM.length - 1].date}`);
  console.log(`   Average Position: ${avgPosition.toFixed(8)} BTC`);
  console.log(`   Maximum Position: ${maxPosition.toFixed(8)} BTC`);
  console.log(`   Minimum Position: ${minPosition.toFixed(8)} BTC`);
  console.log(`   Standard Deviation: ${stdDev.toFixed(8)}`);
  console.log(`\n💡 The Excel file contains:`);
  console.log(`   - "Daily Positions at 8 AM" sheet with all data`);
  console.log(`   - "Summary" sheet with statistics`);
  console.log(`   - "Chart Data" sheet for easy graphing`);
  console.log(`\n📈 You can create charts in Excel by:`);
  console.log(`   1. Go to "Chart Data" sheet`);
  console.log(`   2. Select the data (columns A and B)`);
  console.log(`   3. Insert → Line Chart`);
}

// Run the export
exportToExcel().catch(console.error);
