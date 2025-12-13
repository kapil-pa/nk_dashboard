import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100vh;
    overflow-x: hidden;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    font-size: ${props => props.theme.fontSizes.base};
    font-weight: ${props => props.theme.fontWeights.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
    height: 100vh;
    overflow-x: hidden;
  }

  #root {
    height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.primary};
    font-weight: ${props => props.theme.fontWeights.semibold};
    line-height: 1.25;
    margin: 0;
  }

  h1 { font-size: ${props => props.theme.fontSizes['3xl']}; }
  h2 { font-size: ${props => props.theme.fontSizes['2xl']}; }
  h3 { font-size: ${props => props.theme.fontSizes.xl}; }
  h4 { font-size: ${props => props.theme.fontSizes.lg}; }

  p {
    margin: 0;
    line-height: 1.5;
  }

  code {
    font-family: ${props => props.theme.fonts.mono};
    font-size: ${props => props.theme.fontSizes.sm};
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: ${props => props.theme.transitions.fast};
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: ${props => props.theme.fonts.primary};
    font-weight: ${props => props.theme.fontWeights.medium};
    transition: ${props => props.theme.transitions.fast};
  }

  input, select, textarea {
    font-family: ${props => props.theme.fonts.primary};
    font-size: ${props => props.theme.fontSizes.sm};
    outline: none;
  }

  /* Responsive Grid Classes */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${props => props.theme.spacing.lg};
    width: 100%;
  }

  .sensor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: ${props => props.theme.spacing.md};
    width: 100%;
  }

  .climate-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${props => props.theme.spacing.sm};
    width: 100%;
  }

  /* Mobile Responsiveness */
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    .card-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    .card-grid {
      grid-template-columns: 1fr;
      gap: ${props => props.theme.spacing.md};
    }

    .sensor-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: ${props => props.theme.spacing.sm};
    }

    .climate-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    .sensor-grid {
      grid-template-columns: 1fr;
    }

    .climate-grid {
      grid-template-columns: 1fr;
      gap: ${props => props.theme.spacing.xs};
    }
  }

  /* Prevent content overflow */
  .container {
    max-width: 100%;
    overflow-x: auto;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
`;

export default GlobalStyle;