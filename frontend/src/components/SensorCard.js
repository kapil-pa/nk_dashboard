import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.default};
  border-left: 4px solid ${props => getStatusColor(props.status, props.theme)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Value = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Unit = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
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
  margin-top: ${props => props.theme.spacing.xs};
`;

function getStatusColor(status, theme) {
  switch (status) {
    case 'normal':
      return theme.colors.normal;
    case 'warning':
      return theme.colors.warning;
    case 'critical':
      return theme.colors.critical;
    default:
      return theme.colors.normal;
  }
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

const SensorCard = ({
  title,
  value,
  unit = '',
  status = 'normal',
  timestamp,
  ranges,
  icon
}) => {
  const autoStatus = ranges ? getStatus(value, ranges) : status;

  return (
    <CardContainer status={autoStatus}>
      <Title>{icon} {title}</Title>
      <ValueContainer>
        <Value>{typeof value === 'number' ? value.toFixed(1) : value}</Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>
      <Status status={autoStatus}>{autoStatus}</Status>
      {timestamp && <Timestamp>Updated: {formatTimestamp(timestamp)}</Timestamp>}
    </CardContainer>
  );
};

export default SensorCard;