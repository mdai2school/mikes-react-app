import { useState, useEffect, useMemo } from 'react';
import './StateChart.css';

function StateChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('car');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const response = await fetch('/transportation-data.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('CSV file is empty');
      }
      
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('No data found in CSV file');
      }
      
      const headers = parseCSVLine(lines[0]);
      
      const parsedData = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => row['Total workers'] && row['Total workers'] !== '');

      if (parsedData.length === 0) {
        throw new Error('No valid data rows found in CSV file');
      }

      setData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load transportation data. Please refresh the page.');
      setLoading(false);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const extractState = (name) => {
    if (!name) return 'Unknown';
    const parts = name.split(';');
    return parts.length > 0 ? parts[parts.length - 1].trim() : 'Unknown';
  };

  const stateData = useMemo(() => {
    const aggregated = {};

    data.forEach(row => {
      const state = extractState(row.NAME);
      const totalWorkers = parseFloat(row['Total workers']) || 0;
      const carPercent = parseFloat(row['% of workers traveling by car, truck, or van']) || 0;
      const publicTransitPercent = parseFloat(row['% of workers traveling by public transportation']) || 0;
      const walkingPercent = parseFloat(row['% of workers traveling by walking']) || 0;
      const bicyclePercent = parseFloat(row['% of workers traveling by bicycle']) || 0;
      const workFromHomePercent = parseFloat(row['% of workers working from home']) || 0;

      if (!aggregated[state]) {
        aggregated[state] = {
          state,
          totalWorkers: 0,
          totalCar: 0,
          totalPublicTransit: 0,
          totalWalking: 0,
          totalBicycle: 0,
          totalWorkFromHome: 0,
          tractCount: 0
        };
      }

      aggregated[state].totalWorkers += totalWorkers;
      aggregated[state].totalCar += carPercent * totalWorkers / 100;
      aggregated[state].totalPublicTransit += publicTransitPercent * totalWorkers / 100;
      aggregated[state].totalWalking += walkingPercent * totalWorkers / 100;
      aggregated[state].totalBicycle += bicyclePercent * totalWorkers / 100;
      aggregated[state].totalWorkFromHome += workFromHomePercent * totalWorkers / 100;
      aggregated[state].tractCount += 1;
    });

    return Object.values(aggregated)
      .filter(stateInfo => US_STATES.includes(stateInfo.state))
      .map(stateInfo => ({
        ...stateInfo,
        carPercent: stateInfo.totalWorkers > 0 ? (stateInfo.totalCar / stateInfo.totalWorkers) * 100 : 0,
        publicTransitPercent: stateInfo.totalWorkers > 0 ? (stateInfo.totalPublicTransit / stateInfo.totalWorkers) * 100 : 0,
        walkingPercent: stateInfo.totalWorkers > 0 ? (stateInfo.totalWalking / stateInfo.totalWorkers) * 100 : 0,
        bicyclePercent: stateInfo.totalWorkers > 0 ? (stateInfo.totalBicycle / stateInfo.totalWorkers) * 100 : 0,
        workFromHomePercent: stateInfo.totalWorkers > 0 ? (stateInfo.totalWorkFromHome / stateInfo.totalWorkers) * 100 : 0
      })).sort((a, b) => b.totalWorkers - a.totalWorkers);
  }, [data]);

  const topStates = useMemo(() => {
    return stateData.slice(0, 15);
  }, [stateData]);

  const getBarData = () => {
    const modeMap = {
      car: { key: 'carPercent', label: 'Car/Truck/Van' },
      transit: { key: 'publicTransitPercent', label: 'Public Transit' },
      walking: { key: 'walkingPercent', label: 'Walking' },
      bicycle: { key: 'bicyclePercent', label: 'Bicycle' },
      wfh: { key: 'workFromHomePercent', label: 'Work from Home' }
    };

    const mode = modeMap[selectedMode];
    return topStates.map(state => ({
      state: state.state,
      value: state[mode.key],
      totalWorkers: state.totalWorkers
    })).sort((a, b) => b.value - a.value);
  };

  const modeOptions = [
    { value: 'car', label: 'Car/Truck/Van' },
    { value: 'transit', label: 'Public Transit' },
    { value: 'walking', label: 'Walking' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'wfh', label: 'Work from Home' }
  ];

  const modeColors = {
    car: '#646cff',
    transit: '#4CAF50',
    walking: '#FF9800',
    bicycle: '#2196F3',
    wfh: '#9C27B0'
  };

  const barData = getBarData();
  const maxValue = barData.length > 0 ? Math.max(...barData.map(d => d.value), 1) : 1;
  const hasData = !loading && !error && stateData.length > 0 && barData.length > 0;

  return (
    <div className="state-chart" style={{ padding: '20px', minHeight: '100vh' }}>
      <div className="header">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>
          Transportation to Work by State
        </h1>
        <p className="subtitle" style={{ fontSize: '1rem', color: '#aaa' }}>
          Top 15 States by Total Workers
        </p>
      </div>

      {loading && (
        <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '1.5rem', color: '#fff' }}>
            Loading transportation data...
          </div>
          <div className="loading-subtitle" style={{ marginTop: '10px', color: '#aaa' }}>
            Processing 85,000+ census tract records
          </div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-title">Error Loading Data</div>
          <div className="error-message">{error}</div>
          <button onClick={loadData} className="retry-button">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="controls">
            <label htmlFor="mode-select">Select Transportation Mode:</label>
            <select 
              id="mode-select"
              value={selectedMode} 
              onChange={(e) => setSelectedMode(e.target.value)}
              className="mode-select"
            >
              {modeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="chart-container">
            <div className="chart-title">
              {modeOptions.find(m => m.value === selectedMode)?.label} (%)
            </div>
            <div className="bars-container">
              {!hasData ? (
                <div className="no-data-message">
                  No data available. Please check the CSV file.
                </div>
              ) : (
                barData.map((item, index) => (
                  <div key={`${item.state}-${index}`} className="bar-wrapper">
                    <div className="bar-label">{item.state}</div>
                    <div className="bar-container">
                      <div 
                        className="bar"
                        style={{
                          width: `${(item.value / maxValue) * 100}%`,
                          backgroundColor: modeColors[selectedMode]
                        }}
                      >
                        <span className="bar-value">
                          {item.value.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="bar-workers">
                      {item.totalWorkers.toLocaleString()} workers
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {hasData && (
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-value">{stateData.length}</div>
                <div className="stat-label">Total States</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stateData.reduce((sum, s) => sum + s.totalWorkers, 0).toLocaleString()}</div>
                <div className="stat-label">Total Workers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stateData.reduce((sum, s) => sum + s.tractCount, 0).toLocaleString()}</div>
                <div className="stat-label">Census Tracts</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StateChart;
