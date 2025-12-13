import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.default};
  border-left: 4px solid ${props => getWorstStatus(props.tempStatus, props.humidityStatus, props.theme)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const Location = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
`;

const ReadingsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Reading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ReadingIcon = styled.div`
  font-size: 1.2rem;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.xs};
`;

const Value = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Unit = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const ReadingLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  font-weight: 500;
  margin-top: ${props => props.theme.spacing.xs};
`;

const StatusContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Status = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => getStatusColor(props.status, props.theme)};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
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
      return theme.colors.success;
  }
}

function getWorstStatus(tempStatus, humidityStatus, theme) {
  const statusPriority = { 'critical': 3, 'warning': 2, 'normal': 1 };
  const worstStatus = statusPriority[tempStatus] >= statusPriority[humidityStatus] ? tempStatus : humidityStatus;
  return getStatusColor(worstStatus, theme);
}

function getStatus(value, ranges) {
  if (!ranges) return 'normal';

  if (value < ranges.critical.min || value > ranges.critical.max) {
    return 'critical';
  }
  if (value < ranges.warning.min || value > ranges.warning.max) {
    return 'warning';
  }
  return 'normal';
}

function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString();
}

const DHT22Card = ({
  location,
  temperature,
  humidity,
  timestamp,
  tempRanges,
  humidityRanges
}) => {
  const tempStatus = tempRanges ? getStatus(temperature, tempRanges) : 'normal';
  const humidityStatus = humidityRanges ? getStatus(humidity, humidityRanges) : 'normal';
  const overallStatus = tempStatus === 'critical' || humidityStatus === 'critical' ? 'critical' :
                       tempStatus === 'warning' || humidityStatus === 'warning' ? 'warning' : 'normal';

  return (
    <CardContainer tempStatus={tempStatus} humidityStatus={humidityStatus}>
      <Header>
        <Title>🌡️ DHT22 Sensor</Title>
        <Location>{location}</Location>
      </Header>

      <ReadingsContainer>
        <Reading>
          <ReadingIcon>🌡️</ReadingIcon>
          <ValueContainer>
            <Value>{typeof temperature === 'number' ? temperature.toFixed(1) : temperature}</Value>
            <Unit>°C</Unit>
          </ValueContainer>
          <ReadingLabel>Temperature</ReadingLabel>
        </Reading>

        <Reading>
          <ReadingIcon>💧</ReadingIcon>
          <ValueContainer>
            <Value>{typeof humidity === 'number' ? humidity.toFixed(0) : humidity}</Value>
            <Unit>%</Unit>
          </ValueContainer>
          <ReadingLabel>Humidity</ReadingLabel>
        </Reading>
      </ReadingsContainer>

      <StatusContainer>
        <Status status={overallStatus}>{overallStatus}</Status>
        {timestamp && <Timestamp>Updated: {formatTimestamp(timestamp)}</Timestamp>}
      </StatusContainer>
    </CardContainer>
  );
};

export default DHT22Card;