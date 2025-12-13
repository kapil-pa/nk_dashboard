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

const ACScheduleTable = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  font-weight: 600;
  padding: ${props => props.theme.spacing.md};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const TempSelect = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const SaveButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  margin-top: ${props => props.theme.spacing.lg};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.textMuted};
    cursor: not-allowed;
  }
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

const RoomBack = () => {
  const [sensorData, setSensorData] = useState(null);
  const [acSchedule, setAcSchedule] = useState({});
  const [localSchedule, setLocalSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sensorsResponse, scheduleResponse] = await Promise.all([
        roomAPI.getBackSensors(),
        roomAPI.getACSchedule()
      ]);

      setSensorData(sensorsResponse.data);
      setAcSchedule(scheduleResponse.data.ac_schedule || {});
      setLocalSchedule(scheduleResponse.data.ac_schedule || {});
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to load back room data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleScheduleChange = (hour, temperature) => {
    setLocalSchedule(prev => ({
      ...prev,
      [hour]: parseInt(temperature)
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      await roomAPI.updateACSchedule({ ac_schedule: localSchedule });
      setAcSchedule(localSchedule);
      alert('AC schedule updated successfully!');
    } catch (err) {
      alert(apiUtils.handleError(err, 'Failed to update AC schedule'));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(acSchedule) !== JSON.stringify(localSchedule);

  if (loading) {
    return <LoadingMessage>Loading back room data...</LoadingMessage>;
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
            <SensorCard
              title="AC Set Temperature"
              value={sensorData.ac?.current_set_temp}
              unit="°C"
              timestamp={sensorData.timestamp}
              status="normal"
              icon="❄️"
            />
          </div>
        )}
      </Section>

      {/* AC Control */}
      <Section>
        <SectionTitle>❄️ AC Schedule Control</SectionTitle>
        <ACScheduleTable>
          <TableHeader>
            <div>Hour</div>
            <div>Set Temperature</div>
            <div>Current</div>
          </TableHeader>
          {Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            return (
              <TableRow key={hour}>
                <div>{hour}:00</div>
                <div>
                  <TempSelect
                    value={localSchedule[hour] || 24}
                    onChange={(e) => handleScheduleChange(hour, e.target.value)}
                  >
                    {Array.from({ length: 15 }, (_, i) => i + 16).map(temp => (
                      <option key={temp} value={temp}>{temp}°C</option>
                    ))}
                  </TempSelect>
                </div>
                <div>{acSchedule[hour] || 24}°C</div>
              </TableRow>
            );
          })}
        </ACScheduleTable>
        <SaveButton
          onClick={handleSaveSchedule}
          disabled={!hasChanges || saving}
        >
          {saving ? 'Saving...' : 'Save AC Schedule'}
        </SaveButton>
      </Section>
    </Container>
  );
};

export default RoomBack;