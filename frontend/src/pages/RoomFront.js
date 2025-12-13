import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SensorCard from '../components/SensorCard';
import { roomAPI, apiUtils } from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled.section`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.danger}10;
  color: ${props => props.theme.colors.danger};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.danger}30;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const RoomFront = () => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await roomAPI.getFrontSensors();
      setSensorData(response.data);
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to load front room data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingMessage>Loading front room data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      {/* Environmental Sensors */}
      <Section>
        <SectionTitle>🌡️ Environmental Monitoring</SectionTitle>
        {sensorData && (
          <div className="sensor-grid">
            <SensorCard
              title="Temperature"
              value={sensorData.bme?.temp}
              unit="°C"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 18, max: 30 },
                critical: { min: 15, max: 35 }
              }}
              icon="🌡️"
            />
            <SensorCard
              title="Humidity"
              value={sensorData.bme?.humidity}
              unit="%"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 40, max: 80 },
                critical: { min: 30, max: 90 }
              }}
              icon="💧"
            />
            <SensorCard
              title="Pressure"
              value={sensorData.bme?.pressure}
              unit="hPa"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 990, max: 1030 },
                critical: { min: 980, max: 1040 }
              }}
              icon="🎯"
            />
            <SensorCard
              title="Air Quality (IAQ)"
              value={sensorData.bme?.iaq}
              unit=""
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 0, max: 200 },
                critical: { min: 0, max: 300 }
              }}
              icon="🌬️"
            />
            <SensorCard
              title="CO2 Level"
              value={sensorData.co2}
              unit="ppm"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 300, max: 1200 },
                critical: { min: 250, max: 1500 }
              }}
              icon="🌿"
            />
          </div>
        )}
      </Section>

      {/* System Status */}
      <Section>
        <SectionTitle>📊 System Status</SectionTitle>
        <div className="sensor-grid">
          <SensorCard
            title="Last Update"
            value={sensorData ? new Date(sensorData.timestamp * 1000).toLocaleString() : 'N/A'}
            status="normal"
            icon="🕐"
          />
          <SensorCard
            title="Sensor Status"
            value="Online"
            status="normal"
            icon="✅"
          />
          <SensorCard
            title="Data Points"
            value="5"
            unit="sensors"
            status="normal"
            icon="📈"
          />
        </div>
      </Section>
    </Container>
  );
};

export default RoomFront;