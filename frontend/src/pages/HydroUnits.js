import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const UnitCard = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-decoration: none;
  color: inherit;
  transition: ${props => props.theme.transitions.default};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 2px solid transparent;
  min-height: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const UnitTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  text-align: center;
`;

const hydroUnits = [
  { id: 'DWC1', name: 'Deep Water Culture 1', icon: '💧' },
  { id: 'DWC2', name: 'Deep Water Culture 2', icon: '💧' },
  { id: 'NFT', name: 'Nutrient Film Technique', icon: '🌊' },
  { id: 'AERO', name: 'Aeroponic System', icon: '💨' },
  { id: 'TROUGH', name: 'Trough Based System', icon: '🔄' }
];

const HydroUnits = () => {
  return (
    <Container>
      {hydroUnits.map((unit) => (
        <UnitCard key={unit.id} to={`/hydro-units/${unit.id}`}>
          <UnitTitle>{unit.icon} {unit.id}</UnitTitle>
        </UnitCard>
      ))}
    </Container>
  );
};

export default HydroUnits;