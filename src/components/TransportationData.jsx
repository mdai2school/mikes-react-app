import { useState, useEffect, useMemo } from 'react';
import './TransportationData.css';

function TransportationData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/transportation-data.csv');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = parseCSVLine(lines[0]);
      
      const parsedData = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => row['Total workers'] && row['Total workers'] !== '');

      setData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.NAMELSAD?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort data
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle numeric values
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          aVal = aNum;
          bVal = bNum;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatNumber = (value) => {
    if (!value) return '0';
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString();
  };

  const formatPercent = (value) => {
    if (!value) return '0%';
    const num = parseFloat(value);
    return isNaN(num) ? value : `${num.toFixed(2)}%`;
  };

  if (loading) {
    return <div className="loading">Loading transportation data...</div>;
  }

  return (
    <div className="transportation-data">
      <div className="header">
        <h1>Means of Transportation to Work</h1>
        <p className="subtitle">Census Tract Data - {data.length.toLocaleString()} records</p>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by location name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <div className="results-info">
          Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length.toLocaleString()} results
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('NAME')} className="sortable">
                Location {sortConfig.key === 'NAME' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Total workers')} className="sortable">
                Total Workers {sortConfig.key === 'Total workers' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('% of workers traveling by car, truck, or van')} className="sortable">
                Car/Truck/Van % {sortConfig.key === '% of workers traveling by car, truck, or van' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('% of workers traveling by public transportation')} className="sortable">
                Public Transit % {sortConfig.key === '% of workers traveling by public transportation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('% of workers traveling by walking')} className="sortable">
                Walking % {sortConfig.key === '% of workers traveling by walking' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('% of workers traveling by bicycle')} className="sortable">
                Bicycle % {sortConfig.key === '% of workers traveling by bicycle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('% of workers working from home')} className="sortable">
                Work from Home % {sortConfig.key === '% of workers working from home' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={`${row.OBJECTID}-${index}`}>
                <td className="location-cell">{row.NAME || row.NAMELSAD || 'N/A'}</td>
                <td>{formatNumber(row['Total workers'])}</td>
                <td>{formatPercent(row['% of workers traveling by car, truck, or van'])}</td>
                <td>{formatPercent(row['% of workers traveling by public transportation'])}</td>
                <td>{formatPercent(row['% of workers traveling by walking'])}</td>
                <td>{formatPercent(row['% of workers traveling by bicycle'])}</td>
                <td>{formatPercent(row['% of workers working from home'])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TransportationData;


