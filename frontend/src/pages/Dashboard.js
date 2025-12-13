import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SensorCard from '../components/SensorCard';
import IoTStatusIndicator from '../components/IoTStatusIndicator';
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

const UnitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const UnitCard = styled(Link)`
  display: block;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  text-decoration: none;
  color: inherit;
  transition: ${props => props.theme.transitions.default};
  border: 1px solid ${props => props.theme.colors.border};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const UnitHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
  gap: ${props => props.theme.spacing.sm};
`;

const UnitTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const UnitTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const UnitType = styled.span`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => getStatusColor(props.status, props.theme)};
  color: white;
`;

const UnitMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.sm};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const MetricLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

function getStatusColor(status, theme) {
  switch (status) {
    case 'normal':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'critical':
      return theme.colors.danger;
    default:
      return theme.colors.textMuted;
  }
}

function getUnitStatus(sensorData) {
  if (!sensorData) return 'unknown';

  const { reservoir } = sensorData;
  if (!reservoir) return 'unknown';

  // Check critical ranges
  if (reservoir.ph < 5.5 || reservoir.ph > 7.5) return 'critical';
  if (reservoir.tds < 500 || reservoir.tds > 1500) return 'critical';
  if (reservoir.water_level < 20) return 'critical';

  // Check warning ranges
  if (reservoir.ph < 6.0 || reservoir.ph > 7.0) return 'warning';
  if (reservoir.tds < 700 || reservoir.tds > 1300) return 'warning';
  if (reservoir.water_level < 50) return 'warning';

  return 'normal';
}

const Dashboard = () => {
  const [hydroUnitsData, setHydroUnitsData] = useState({});
  const [roomData, setRoomData] = useState({ front: null, back: null });
  const [cameraStats, setCameraStats] = useState({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  const { connected } = useSocket();

  const hydroUnits = [
    { id: 'DWC1', name: 'Deep Water Culture 1', type: 'Deep Water Culture', icon: '💧' },
    { id: 'DWC2', name: 'Deep Water Culture 2', type: 'Deep Water Culture', icon: '💧' },
    { id: 'NFT', name: 'Nutrient Film Technique', type: 'NFT System', icon: '🌊' },
    { id: 'AERO', name: 'Aeroponic System', type: 'Aeroponic', icon: '💨' },
    { id: 'TROUGH', name: 'Trough Based System', type: 'Trough System', icon: '🔄' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch hydro units data
        const hydroPromises = hydroUnits.map(async (unit) => {
          const response = await axios.get(`/units/${unit.id}/sensors`);
          return { unitId: unit.id, data: response.data };
        });

        const hydroResults = await Promise.all(hydroPromises);
        const hydroData = {};
        hydroResults.forEach(({ unitId, data }) => {
          hydroData[unitId] = data;
        });
        setHydroUnitsData(hydroData);

        // Fetch room data
        const [frontResponse, backResponse] = await Promise.all([
          axios.get('/room/front/sensors'),
          axios.get('/room/back/sensors')
        ]);

        setRoomData({
          front: frontResponse.data,
          back: backResponse.data
        });

        // Fetch camera statistics
        let totalCameras = 0;
        let onlineCameras = 0;

        for (const unit of hydroUnits) {
          try {
            const cameraResponse = await axios.get(`/cameras/${unit.id}`);
            const cameras = cameraResponse.data.cameras || [];
            totalCameras += cameras.length;

            // Count online cameras (images received within 5 minutes)
            const now = Math.floor(Date.now() / 1000);
            cameras.forEach(camera => {
              if (camera.last_image_timestamp && (now - camera.last_image_timestamp) <= 300) {
                onlineCameras++;
              }
            });
          } catch (error) {
            console.warn(`Error fetching cameras for ${unit.id}:`, error);
          }
        }

        setCameraStats({ total: totalCameras, online: onlineCameras });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingMessage>Loading dashboard data...</LoadingMessage>;
  }

  return (
    <Container>
      {/* System Overview */}
      <Section>
        <SectionTitle>🌿 System Overview</SectionTitle>
        <div className="card-grid">
          <SensorCard
            title="Total Systems"
            value={hydroUnits.length}
            unit="systems"
            status="normal"
            icon="🌱"
          />
          <SensorCard
            title="Systems Online"
            value={Object.keys(hydroUnitsData).length}
            unit="active"
            status={Object.keys(hydroUnitsData).length === hydroUnits.length ? 'normal' : 'warning'}
            icon="✅"
          />
          <SensorCard
            title="Average pH"
            value={
              Object.values(hydroUnitsData).length > 0
                ? Object.values(hydroUnitsData)
                    .reduce((sum, unit) => sum + (unit.reservoir?.ph || 0), 0) /
                  Object.values(hydroUnitsData).length
                : 0
            }
            unit=""
            status="normal"
            icon="⚗️"
          />
          <SensorCard
            title="Cameras Online"
            value={`${cameraStats.online}/${cameraStats.total}`}
            unit="cameras"
            status={cameraStats.online === cameraStats.total ? 'normal' :
                   cameraStats.online > 0 ? 'warning' : 'critical'}
            icon="📷"
          />
          <SensorCard
            title="WebSocket"
            value={connected ? 'Connected' : 'Disconnected'}
            status={connected ? 'normal' : 'critical'}
            icon="📡"
          />
        </div>
      </Section>

      {/* Hydro Units */}
      <Section>
        <SectionTitle>🌱 Hydroponic Systems</SectionTitle>
        <UnitsGrid>
          {hydroUnits.map((unit) => {
            const data = hydroUnitsData[unit.id];
            const status = getUnitStatus(data);

            return (
              <UnitCard key={unit.id} to={`/hydro-units/${unit.id}`}>
                <UnitHeader>
                  <UnitTitleContainer>
                    <UnitTitle>{unit.icon} {unit.id}</UnitTitle>
                    <UnitType>{unit.type}</UnitType>
                  </UnitTitleContainer>
                  <StatusContainer>
                    <IoTStatusIndicator
                      unitId={unit.id}
                      timestamp={data?.timestamp}
                      compact={false}
                    />
                    <StatusBadge status={status}>{status}</StatusBadge>
                  </StatusContainer>
                </UnitHeader>

                {data ? (
                  <UnitMetrics>
                    <MetricItem>
                      <MetricLabel>pH</MetricLabel>
                      <MetricValue>{data.reservoir?.ph?.toFixed(1) || 'N/A'}</MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <MetricLabel>TDS</MetricLabel>
                      <MetricValue>{data.reservoir?.tds || 'N/A'}</MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <MetricLabel>Water Temp</MetricLabel>
                      <MetricValue>{data.reservoir?.water_temp?.toFixed(1) || 'N/A'}°C</MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <MetricLabel>Water Level</MetricLabel>
                      <MetricValue>{data.reservoir?.water_level || 'N/A'}%</MetricValue>
                    </MetricItem>
                  </UnitMetrics>
                ) : (
                  <LoadingMessage>No data available</LoadingMessage>
                )}
              </UnitCard>
            );
          })}
        </UnitsGrid>
      </Section>

      {/* Room Monitoring */}
      <Section>
        <SectionTitle>🏠 Room Monitoring</SectionTitle>
        <div className="card-grid">
          {/* Front Room */}
          {roomData.front && (
            <>
              <SensorCard
                title="Front Room Temp"
                value={roomData.front.bme?.temp}
                unit="°C"
                timestamp={roomData.front.timestamp}
                ranges={{
                  warning: { min: 18, max: 30 },
                  critical: { min: 15, max: 35 }
                }}
                icon="🌡️"
              />
              <SensorCard
                title="Front Room Humidity"
                value={roomData.front.bme?.humidity}
                unit="%"
                timestamp={roomData.front.timestamp}
                ranges={{
                  warning: { min: 40, max: 80 },
                  critical: { min: 30, max: 90 }
                }}
                icon="💧"
              />
              <SensorCard
                title="Front Room CO2"
                value={roomData.front.co2}
                unit="ppm"
                timestamp={roomData.front.timestamp}
                ranges={{
                  warning: { min: 300, max: 1200 },
                  critical: { min: 250, max: 1500 }
                }}
                icon="🌬️"
              />
            </>
          )}

          {/* Back Room */}
          {roomData.back && (
            <>
              <SensorCard
                title="Back Room Temp"
                value={roomData.back.bme?.temp}
                unit="°C"
                timestamp={roomData.back.timestamp}
                ranges={{
                  warning: { min: 18, max: 30 },
                  critical: { min: 15, max: 35 }
                }}
                icon="🌡️"
              />
              <SensorCard
                title="Back Room AC"
                value={roomData.back.ac?.current_set_temp}
                unit="°C"
                status="normal"
                timestamp={roomData.back.timestamp}
                icon="❄️"
              />
            </>
          )}
        </div>
      </Section>
    </Container>
  );
};

export default Dashboard;