import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SensorCard from '../components/SensorCard';
import DHT22Card from '../components/DHT22Card';
import ToggleRelay from '../components/ToggleRelay';
import TimeRange from '../components/TimeRange';
import PumpCycle from '../components/PumpCycle';
import { hydroUnitsAPI, apiUtils } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

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

const ClimateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
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

const HydroUnitDetail = () => {
  const { unitId } = useParams();
  const { joinUnit, leaveUnit } = useSocket();

  const [sensorData, setSensorData] = useState(null);
  const [relayData, setRelayData] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (unitId) {
      joinUnit(unitId);
      return () => leaveUnit(unitId);
    }
  }, [unitId, joinUnit, leaveUnit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sensorsResponse, relaysResponse, scheduleResponse] = await Promise.all([
        hydroUnitsAPI.getSensors(unitId),
        hydroUnitsAPI.getRelays(unitId),
        hydroUnitsAPI.getSchedule(unitId)
      ]);

      setSensorData(sensorsResponse.data);
      setRelayData(relaysResponse.data);
      setScheduleData(scheduleResponse.data);
    } catch (err) {
      setError(apiUtils.handleError(err, `Failed to load data for ${unitId}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [unitId]);

  const handleRelayUpdate = async (relayType, newState) => {
    try {
      const updateData = { [relayType]: newState };
      const response = await hydroUnitsAPI.updateRelay(unitId, updateData);
      setRelayData(response.data);

      // Refresh schedule data to get updated control mode (manual)
      const scheduleResponse = await hydroUnitsAPI.getSchedule(unitId);
      setScheduleData(scheduleResponse.data);
    } catch (err) {
      console.error('Error updating relay:', err);
      throw new Error(apiUtils.handleError(err, 'Failed to update relay'));
    }
  };

  const handleTimeRangeUpdate = async (relayType, timeData) => {
    try {
      const scheduleUpdate = {
        ...scheduleData,
        [relayType]: timeData
      };
      const response = await hydroUnitsAPI.updateSchedule(unitId, scheduleUpdate);

      // Update with the response that includes the new control mode
      setScheduleData(response.data);
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw new Error(apiUtils.handleError(err, 'Failed to update schedule'));
    }
  };

  const handlePumpCycleUpdate = async (pumpData) => {
    try {
      const scheduleUpdate = {
        ...scheduleData,
        pump_cycle: pumpData
      };
      const response = await hydroUnitsAPI.updateSchedule(unitId, scheduleUpdate);

      // Update with the response that includes the new control mode
      setScheduleData(response.data);
    } catch (err) {
      console.error('Error updating pump cycle:', err);
      throw new Error(apiUtils.handleError(err, 'Failed to update pump cycle'));
    }
  };


  if (loading) {
    return <LoadingMessage>Loading {unitId} data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      {/* Reservoir Sensors */}
      <Section>
        <SectionTitle>🧪 Reservoir Sensors</SectionTitle>
        {sensorData?.reservoir && (
          <div className="sensor-grid">
            <SensorCard
              title="pH Level"
              value={sensorData.reservoir.ph}
              unit=""
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 5.8, max: 7.2 },
                critical: { min: 5.0, max: 8.0 }
              }}
              icon="⚗️"
            />
            <SensorCard
              title="TDS"
              value={sensorData.reservoir.tds}
              unit="ppm"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 700, max: 1300 },
                critical: { min: 500, max: 1500 }
              }}
              icon="💎"
            />
            <SensorCard
              title="Turbidity"
              value={sensorData.reservoir.turbidity}
              unit="NTU"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 0, max: 15 },
                critical: { min: 0, max: 25 }
              }}
              icon="🌊"
            />
            <SensorCard
              title="Water Temperature"
              value={sensorData.reservoir.water_temp}
              unit="°C"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 18, max: 26 },
                critical: { min: 15, max: 30 }
              }}
              icon="🌡️"
            />
            <SensorCard
              title="Water Level"
              value={sensorData.reservoir.water_level}
              unit="%"
              timestamp={sensorData.timestamp}
              ranges={{
                warning: { min: 30, max: 100 },
                critical: { min: 20, max: 100 }
              }}
              icon="📊"
            />
          </div>
        )}
      </Section>

      {/* Climate Sensors */}
      <Section>
        <SectionTitle>🌡️ Climate Sensors (8 Levels)</SectionTitle>
        {sensorData?.climate && (
          <ClimateGrid>
            {Object.entries(sensorData.climate).map(([location, data]) => (
              <DHT22Card
                key={location}
                location={location}
                temperature={data.temp}
                humidity={data.humidity}
                timestamp={sensorData.timestamp}
                tempRanges={{
                  warning: { min: 20, max: 28 },
                  critical: { min: 15, max: 35 }
                }}
                humidityRanges={{
                  warning: { min: 50, max: 80 },
                  critical: { min: 30, max: 90 }
                }}
              />
            ))}
          </ClimateGrid>
        )}
      </Section>

      {/* Actuator Controls */}
      <Section>
        <SectionTitle>🎛️ Actuator Controls</SectionTitle>
        {relayData?.relays && (
          <div>
            <ToggleRelay
              label="Lights"
              state={relayData.relays.lights}
              onChange={(newState) => handleRelayUpdate('lights', newState)}
              icon="💡"
              controlMode={scheduleData._control_mode || 'timer'}
              scheduleInfo={scheduleData.lights}
            />
            <ToggleRelay
              label="Fans"
              state={relayData.relays.fans}
              onChange={(newState) => handleRelayUpdate('fans', newState)}
              icon="🌀"
              controlMode={scheduleData._control_mode || 'timer'}
              scheduleInfo={scheduleData.fans}
            />
            <ToggleRelay
              label="Pump"
              state={relayData.relays.pump}
              onChange={(newState) => handleRelayUpdate('pump', newState)}
              icon="💧"
              controlMode={scheduleData._control_mode || 'timer'}
              scheduleInfo={scheduleData.pump_cycle ? {
                detail: `${scheduleData.pump_cycle.on_duration_sec}s ON / ${scheduleData.pump_cycle.interval_sec}s cycle`
              } : null}
            />
          </div>
        )}
      </Section>

      {/* Schedule Settings */}
      <Section>
        <SectionTitle>⏰ Schedule Settings</SectionTitle>
        <div>
          <TimeRange
            label="Lights"
            on={scheduleData.lights?.on}
            off={scheduleData.lights?.off}
            onUpdate={(timeData) => handleTimeRangeUpdate('lights', timeData)}
            icon="💡"
            controlMode={scheduleData._control_mode || 'timer'}
          />
          <TimeRange
            label="Fans"
            on={scheduleData.fans?.on}
            off={scheduleData.fans?.off}
            onUpdate={(timeData) => handleTimeRangeUpdate('fans', timeData)}
            icon="🌀"
            controlMode={scheduleData._control_mode || 'timer'}
          />
          <PumpCycle
            durationSec={scheduleData.pump_cycle?.on_duration_sec}
            intervalSec={scheduleData.pump_cycle?.interval_sec}
            onUpdate={handlePumpCycleUpdate}
          />
        </div>
      </Section>

    </Container>
  );
};

export default HydroUnitDetail;