import { positions8AM } from './analyze_positions';
import * as fs from 'fs';

function generateHTMLChart() {
  // Prepare data for the chart
  const dates = positions8AM.map(p => p.date);
  const positions = positions8AM.map(p => p.position);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BTC Position Analysis - Daily at 8 AM UTC</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 30px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 1.8em;
            font-weight: bold;
        }
        .chart-container {
            position: relative;
            height: 500px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 20px;
            font-size: 0.9em;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 BTC Position Analysis</h1>
        <div class="subtitle">Daily Positions at 8:00 AM UTC | ${dates[0]} to ${dates[dates.length - 1]}</div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Days</div>
                <div class="stat-value">${positions8AM.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Position</div>
                <div class="stat-value">${(positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(5)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Max Position</div>
                <div class="stat-value">${Math.max(...positions).toFixed(5)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Min Position</div>
                <div class="stat-value">${Math.min(...positions).toFixed(5)}</div>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="positionChart"></canvas>
        </div>
        
        <div class="footer">
            Generated on ${new Date().toLocaleString()} | Data from Trade History
        </div>
    </div>
    
    <script>
        const ctx = document.getElementById('positionChart').getContext('2d');
        
        const data = {
            labels: ${JSON.stringify(dates)},
            datasets: [{
                label: 'BTC Position at 8 AM UTC',
                data: ${JSON.stringify(positions)},
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(102, 126, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'BTC Position Over Time',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toFixed(8) + ' BTC';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Position (BTC)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(5);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };
        
        new Chart(ctx, config);
    </script>
</body>
</html>
`;

  // Write the HTML file
  const filename = 'position_chart.html';
  fs.writeFileSync(filename, html);
  
  console.log(`\n✅ Chart HTML file created successfully: ${filename}`);
  console.log(`\n💡 Open the file in your browser to view the interactive chart!`);
  console.log(`   You can open it with: open ${filename}`);
}

// Generate the chart
generateHTMLChart();
