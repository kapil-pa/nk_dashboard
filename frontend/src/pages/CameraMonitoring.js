import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CameraGrid from '../components/CameraGrid';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const PageHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const PageDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const UnitSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing.lg};
`;

const UnitButton = styled.button`
  background: ${props => props.active
    ? props.theme.colors.primary
    : props.theme.colors.background};
  color: ${props => props.active
    ? 'white'
    : props.theme.colors.text};
  border: 2px solid ${props => props.active
    ? props.theme.colors.primary
    : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.active
      ? props.theme.colors.primary
      : props.theme.colors.surfaceHover};
  }
`;

const CameraSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StatusOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatusCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => {
    if (props.type === 'online') return props.theme.colors.success;
    if (props.type === 'warning') return props.theme.colors.warning;
    if (props.type === 'offline') return props.theme.colors.danger;
    return props.theme.colors.border;
  }};
`;

const StatusNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => {
    if (props.type === 'online') return props.theme.colors.success;
    if (props.type === 'warning') return props.theme.colors.warning;
    if (props.type === 'offline') return props.theme.colors.danger;
    return props.theme.colors.text;
  }};
`;

const StatusLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const NoUnitSelected = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const HYDRO_UNITS = ['DWC1', 'DWC2', 'NFT', 'AERO', 'TROUGH'];

const CameraMonitoring = () => {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [overallStatus, setOverallStatus] = useState({
    online: 0,
    warning: 0,
    offline: 0,
    total: 0
  });

  useEffect(() => {
    fetchOverallStatus();
    const interval = setInterval(fetchOverallStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOverallStatus = async () => {
    try {
      const response = await axios.get('/cameras/status');
      const data = response.data;

      let online = 0, warning = 0, offline = 0, total = 0;

      Object.values(data.units || {}).forEach(cameras => {
        cameras.forEach(camera => {
          total++;
          if (camera.status === 'online') online++;
          else if (camera.status === 'warning') warning++;
          else offline++;
        });
      });

      setOverallStatus({ online, warning, offline, total });
    } catch (error) {
      console.error('Error fetching camera status:', error);
    }
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>
          📷 Camera Monitoring System
        </PageTitle>
        <PageDescription>
          Monitor all camera feeds across your hydroponic units. View live images, check camera status, and track activity.
        </PageDescription>

        <StatusOverview>
          <StatusCard type="online">
            <StatusNumber type="online">{overallStatus.online}</StatusNumber>
            <StatusLabel>Online Cameras</StatusLabel>
          </StatusCard>
          <StatusCard type="warning">
            <StatusNumber type="warning">{overallStatus.warning}</StatusNumber>
            <StatusLabel>Warning</StatusLabel>
          </StatusCard>
          <StatusCard type="offline">
            <StatusNumber type="offline">{overallStatus.offline}</StatusNumber>
            <StatusLabel>Offline</StatusLabel>
          </StatusCard>
          <StatusCard>
            <StatusNumber>{overallStatus.total}</StatusNumber>
            <StatusLabel>Total Cameras</StatusLabel>
          </StatusCard>
        </StatusOverview>

        <UnitSelector>
          {HYDRO_UNITS.map(unit => (
            <UnitButton
              key={unit}
              active={selectedUnit === unit}
              onClick={() => setSelectedUnit(unit)}
            >
              {unit}
            </UnitButton>
          ))}
        </UnitSelector>
      </PageHeader>

      <CameraSection>
        {selectedUnit ? (
          <CameraGrid unitId={selectedUnit} />
        ) : (
          <NoUnitSelected>
            👆 Select a hydroponic unit above to view its cameras
          </NoUnitSelected>
        )}
      </CameraSection>
    </Container>
  );
};

export default CameraMonitoring;