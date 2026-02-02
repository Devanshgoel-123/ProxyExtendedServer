const fs = require('fs');

// Generate sample Vesu position data for the last 7 days
function generateSampleData() {
  const dates = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Sample data - replace with actual data when available
  const samplePositions = [
    { date: dates[0], collateral: 0.32456, debt: 20245.50, price: 62400, ltv: 0.685 },
    { date: dates[1], collateral: 0.33124, debt: 20890.25, price: 63050, ltv: 0.682 },
    { date: dates[2], collateral: 0.31876, debt: 19956.80, price: 62600, ltv: 0.692 },
    { date: dates[3], collateral: 0.34012, debt: 21540.75, price: 63320, ltv: 0.678 },
    { date: dates[4], collateral: 0.32890, debt: 20680.40, price: 62850, ltv: 0.688 },
    { date: dates[5], collateral: 0.33567, debt: 21156.90, price: 63050, ltv: 0.683 },
    { date: dates[6], collateral: 0.32234, debt: 20289.60, price: 62950, ltv: 0.691 }
  ];

  return samplePositions;
}

function generateChart() {
  const positions = generateSampleData();
  
  const dates = positions.map(p => p.date);
  const collateralData = positions.map(p => p.collateral);
  const debtData = positions.map(p => p.debt);
  const ltvData = positions.map(p => p.ltv * 100); // Convert to percentage
  const priceData = positions.map(p => p.price);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vesu Position Analysis - WBTC/USDC</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            padding: 40px;
        }
        h1 {
            color: #1e3c72;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
            font-weight: 700;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 1.2em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
        }
        .stat-label {
            font-size: 0.95em;
            opacity: 0.95;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-subvalue {
            font-size: 0.85em;
            opacity: 0.9;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
        }
        .chart-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 0.95em;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Vesu Position Analysis</h1>
        <div class="subtitle">WBTC/USDC Pool | Daily Positions at 8:00 AM UTC</div>
        
        <div class="warning">
            ⚠️ This is sample data for visualization. Run the calculation script with proper blockchain data to get actual positions.
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Average Collateral</div>
                <div class="stat-value">${(collateralData.reduce((a, b) => a + b, 0) / collateralData.length).toFixed(5)}</div>
                <div class="stat-subvalue">WBTC</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Debt</div>
                <div class="stat-value">$${(debtData.reduce((a, b) => a + b, 0) / debtData.length).toFixed(2)}</div>
                <div class="stat-subvalue">USDC</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average LTV</div>
                <div class="stat-value">${(ltvData.reduce((a, b) => a + b, 0) / ltvData.length).toFixed(2)}%</div>
                <div class="stat-subvalue">Target: 70%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg BTC Price</div>
                <div class="stat-value">$${(priceData.reduce((a, b) => a + b, 0) / priceData.length).toFixed(0)}</div>
                <div class="stat-subvalue">USD</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">Collateral Position (WBTC)</div>
                <div class="chart-wrapper">
                    <canvas id="collateralChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Debt Position (USDC)</div>
                <div class="chart-wrapper">
                    <canvas id="debtChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Loan-to-Value Ratio (LTV)</div>
                <div class="chart-wrapper">
                    <canvas id="ltvChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">BTC Price (USD)</div>
                <div class="chart-wrapper">
                    <canvas id="priceChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Generated on ${new Date().toLocaleString()} | 
            Vesu Re7USDCPrime Pool | 
            Period: ${dates[0]} to ${dates[dates.length - 1]}
        </div>
    </div>
    
    <script>
        const dates = ${JSON.stringify(dates)};
        const collateralData = ${JSON.stringify(collateralData)};
        const debtData = ${JSON.stringify(debtData)};
        const ltvData = ${JSON.stringify(ltvData)};
        const priceData = ${JSON.stringify(priceData)};

        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };

        // Collateral Chart
        new Chart(document.getElementById('collateralChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'WBTC Collateral',
                    data: collateralData,
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'WBTC Amount',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(5);
                            }
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return 'Collateral: ' + context.parsed.y.toFixed(8) + ' WBTC';
                            }
                        }
                    }
                }
            }
        });

        // Debt Chart
        new Chart(document.getElementById('debtChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'USDC Debt',
                    data: debtData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'USDC Amount',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return 'Debt: $' + context.parsed.y.toFixed(2) + ' USDC';
                            }
                        }
                    }
                }
            }
        });

        // LTV Chart
        new Chart(document.getElementById('ltvChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'LTV %',
                    data: ltvData,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'LTV %',
                            font: { size: 14, weight: 'bold' }
                        },
                        min: 65,
                        max: 75,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '%';
                            }
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return 'LTV: ' + context.parsed.y.toFixed(2) + '%';
                            }
                        }
                    }
                }
            }
        });

        // Price Chart
        new Chart(document.getElementById('priceChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'BTC Price',
                    data: priceData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price (USD)',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return 'BTC: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
`;

  return html;
}

// Generate and save the chart
const html = generateChart();
const filename = './vesu_positions_chart.html';
fs.writeFileSync(filename, html);

console.log('\n✅ Vesu Position Chart Generated Successfully!');
console.log(`📁 File: ${filename}`);
console.log(`\n💡 To view the chart:`);
console.log(`   open ${filename}`);
console.log(`\n📊 The chart includes:`);
console.log(`   - Collateral (WBTC) over time`);
console.log(`   - Debt (USDC) over time`);
console.log(`   - LTV ratio tracking`);
console.log(`   - BTC price movements`);
console.log(`\n⚠️  Note: This is sample data. Update with actual blockchain data for real positions.`);
