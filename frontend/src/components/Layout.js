import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSocket } from '../contexts/SocketContext';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  overflow: hidden;
`;

const Sidebar = styled.nav`
  width: 240px;
  min-width: 240px;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${props => props.theme.colors.border};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 200px;
    min-width: 200px;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 180px;
    min-width: 180px;
    padding: ${props => props.theme.spacing.md};
  }
`;

const Logo = styled.div`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const NavItem = styled.li``;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.isActive
    ? props.theme.colors.primary
    : props.theme.colors.textSecondary};
  background: ${props => props.isActive
    ? `${props.theme.colors.primary}15`
    : 'transparent'};
  transition: ${props => props.theme.transitions.fast};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  font-size: ${props => props.theme.fontSizes.sm};

  &:hover {
    background: ${props => props.isActive
      ? `${props.theme.colors.primary}25`
      : props.theme.colors.surfaceHover};
    color: ${props => props.isActive
      ? props.theme.colors.primary
      : props.theme.colors.text};
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  min-height: 80px;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.md};
    min-height: 70px;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSizes.xl};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
  overflow-y: auto;
  height: calc(100vh - 80px);

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.md};
    height: calc(100vh - 70px);
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.connected
    ? props.theme.colors.success
    : props.theme.colors.danger};
  box-shadow: 0 0 0 2px ${props => props.connected
    ? `${props.theme.colors.success}30`
    : `${props.theme.colors.danger}30`};
`;

const StatusText = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.connected
    ? props.theme.colors.success
    : props.theme.colors.danger};
`;

const navItems = [
  { path: '/', label: '🏠 Dashboard', exact: true },
  { path: '/hydro-units', label: '🌱 Hydro Units' },
  { path: '/cameras', label: '📷 Cameras' },
  { path: '/export', label: '📊 Data Export' },
  { path: '/room-front', label: '🏠 Front Room' },
  { path: '/room-back', label: '🏠 Back Room' },
];

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/hydro-units') return 'Hydro Units';
  if (pathname.startsWith('/hydro-units/')) {
    const unitId = pathname.split('/')[2];
    return `Unit ${unitId.toUpperCase()}`;
  }
  if (pathname === '/cameras') return 'Camera Monitoring';
  if (pathname === '/export') return 'Data Export';
  if (pathname === '/room-front') return 'Front Room';
  if (pathname === '/room-back') return 'Back Room';
  return 'Hydroponics System';
}

const Layout = ({ children }) => {
  const location = useLocation();
  const { connected } = useSocket();

  return (
    <Container>
      <Sidebar>
        <Logo>🌿 Hydroponics</Logo>
        <NavList>
          {navItems.map((item) => (
            <NavItem key={item.path}>
              <NavLink
                to={item.path}
                isActive={
                  item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path)
                }
              >
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Sidebar>

      <Main>
        <Header>
          <Title>{getPageTitle(location.pathname)}</Title>
          <StatusIndicator>
            <StatusDot connected={connected} />
            <StatusText>
              {connected ? 'Connected' : 'Disconnected'}
            </StatusText>
          </StatusIndicator>
        </Header>
        <Content>
          {children}
        </Content>
      </Main>
    </Container>
  );
};

export default Layout;