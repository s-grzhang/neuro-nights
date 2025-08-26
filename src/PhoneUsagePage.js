import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import PhonePickupTracker from './utils/PhonePickupTracker';
import './PhoneUsagePage.css';

const PhoneUsagePage = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupData, setPickupData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [nightPickups, setNightPickups] = useState([]);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(7); // default to 7 days

  useEffect(() => {
    checkPermissionAndLoadData();
  }, [timeframe]);

  const checkPermissionAndLoadData = async () => {
    setIsLoading(true);
    try {
      const permissionStatus = await PhonePickupTracker.hasPermission();
      setHasPermission(permissionStatus);
      
      if (permissionStatus) {
        await loadData();
      }
    } catch (err) {
      setError("Failed to check permissions: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await PhonePickupTracker.requestPermission();
      setHasPermission(granted);
      
      if (granted) {
        await loadData();
      }
    } catch (err) {
      setError("Failed to request permissions: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [pickups, sleep, night] = await Promise.all([
        PhonePickupTracker.getPhonePickups(timeframe),
        PhonePickupTracker.getSleepData(timeframe),
        PhonePickupTracker.getNightPickups(timeframe),
      ]);
      
      setPickupData(pickups || []);
      setSleepData(sleep || []);
      setNightPickups(night || []);
    } catch (err) {
      setError("Failed to load usage data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate averages and summaries
  const calculateStats = () => {
    if (!pickupData.length) return { avgPickups: 0, avgScreenTime: 0 };
    
    const totalPickups = pickupData.reduce((sum, day) => sum + day.count, 0);
    const totalScreenTime = pickupData.reduce((sum, day) => sum + day.screenTime, 0);
    
    return {
      avgPickups: Math.round(totalPickups / pickupData.length),
      avgScreenTime: (totalScreenTime / pickupData.length).toFixed(1)
    };
  };

  const calculateSleepStats = () => {
    if (!sleepData.length) return { avgSleep: 0, avgEfficiency: 0 };
    
    const totalSleep = sleepData.reduce((sum, day) => sum + day.totalHours, 0);
    const totalEfficiency = sleepData.reduce((sum, day) => sum + day.efficiency, 0);
    
    return {
      avgSleep: (totalSleep / sleepData.length).toFixed(1),
      avgEfficiency: Math.round(totalEfficiency / sleepData.length)
    };
  };

  const calculateNightStats = () => {
    if (!nightPickups.length) return { avgDisruptions: 0, avgTimeAwake: 0 };
    
    const totalDisruptions = nightPickups.reduce((sum, day) => sum + day.disruptions, 0);
    const totalTimeAwake = nightPickups.reduce((sum, day) => sum + day.timeAwake, 0);
    
    return {
      avgDisruptions: (totalDisruptions / nightPickups.length).toFixed(1),
      avgTimeAwake: Math.round(totalTimeAwake / nightPickups.length)
    };
  };

  const stats = calculateStats();
  const sleepStats = calculateSleepStats();
  const nightStats = calculateNightStats();

  if (!PhonePickupTracker.isAndroidDevice()) {
    return (
      <Container className="phone-usage-page">
        <h1>Phone Usage Tracker</h1>
        <Alert variant="warning">
          This feature is only available on Android devices.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="phone-usage-page">
      <h1>Phone Usage Tracker</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {!hasPermission ? (
        <Card className="permission-card">
          <Card.Body>
            <Card.Title>Permission Required</Card.Title>
            <Card.Text>
              To track your phone usage, we need permission to access usage statistics.
              This data never leaves your device and is only used to help you monitor your habits.
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={requestPermission}
              disabled={isLoading}
            >
              {isLoading ? 'Requesting...' : 'Grant Permission'}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="timeframe-selector">
            <Button 
              variant={timeframe === 7 ? "primary" : "outline-primary"} 
              onClick={() => setTimeframe(7)}
              className="mr-2"
            >
              7 Days
            </Button>
            <Button 
              variant={timeframe === 14 ? "primary" : "outline-primary"} 
              onClick={() => setTimeframe(14)}
              className="mr-2"
            >
              14 Days
            </Button>
            <Button 
              variant={timeframe === 30 ? "primary" : "outline-primary"} 
              onClick={() => setTimeframe(30)}
            >
              30 Days
            </Button>
          </div>

          {isLoading ? (
            <div className="loading-indicator">Loading usage data...</div>
          ) : (
            <Row>
              <Col md={4}>
                <Card className="stat-card pickup-card">
                  <Card.Body>
                    <Card.Title>Phone Pickups</Card.Title>
                    <div className="stat-value">{stats.avgPickups}</div>
                    <div className="stat-label">Avg. daily pickups</div>
                    <div className="stat-secondary">{stats.avgScreenTime} hours</div>
                    <div className="stat-secondary-label">Avg. daily screen time</div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="stat-card sleep-card">
                  <Card.Body>
                    <Card.Title>Sleep Stats</Card.Title>
                    <div className="stat-value">{sleepStats.avgSleep}</div>
                    <div className="stat-label">Avg. hours of sleep</div>
                    <div className="stat-secondary">{sleepStats.avgEfficiency}%</div>
                    <div className="stat-secondary-label">Sleep efficiency</div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="stat-card night-card">
                  <Card.Body>
                    <Card.Title>Night Disruptions</Card.Title>
                    <div className="stat-value">{nightStats.avgDisruptions}</div>
                    <div className="stat-label">Avg. disruptions</div>
                    <div className="stat-secondary">{nightStats.avgTimeAwake} min</div>
                    <div className="stat-secondary-label">Avg. time awake</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <h2 className="mt-4">Daily Breakdown</h2>
          <Row>
            <Col>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pickups</th>
                      <th>Screen Time</th>
                      <th>Sleep Hours</th>
                      <th>Night Disruptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickupData.map((day, index) => (
                      <tr key={day.date}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td>{day.count}</td>
                        <td>{day.screenTime} hrs</td>
                        <td>{sleepData[index]?.totalHours || '-'}</td>
                        <td>{nightPickups[index]?.disruptions || '-'}</td>
                      </tr>
                    ))}
                    {pickupData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="no-data">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Card className="info-card">
                <Card.Body>
                  <Card.Title>How to Improve</Card.Title>
                  <ul className="tips-list">
                    <li>Set app timers to limit usage of distracting apps</li>
                    <li>Turn on Do Not Disturb during sleep hours</li>
                    <li>Use grayscale mode to make your phone less appealing</li>
                    <li>Keep your phone out of the bedroom at night</li>
                    <li>Disable non-essential notifications</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PhoneUsagePage; 