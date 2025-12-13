import React, { useState } from 'react';
import styled from 'styled-components';
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

const ExportSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SectionDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: ${props => props.theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: ${props => props.theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  background: ${props => {
    if (props.variant === 'primary') return props.theme.colors.primary;
    if (props.variant === 'success') return props.theme.colors.success;
    return props.theme.colors.secondary;
  }};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => {
    if (props.type === 'success') return `${props.theme.colors.success}15`;
    if (props.type === 'error') return `${props.theme.colors.danger}15`;
    return `${props.theme.colors.primary}15`;
  }};
  color: ${props => {
    if (props.type === 'success') return props.theme.colors.success;
    if (props.type === 'error') return props.theme.colors.danger;
    return props.theme.colors.primary;
  }};
  border: 1px solid ${props => {
    if (props.type === 'success') return `${props.theme.colors.success}30`;
    if (props.type === 'error') return `${props.theme.colors.danger}30`;
    return `${props.theme.colors.primary}30`;
  }};
`;

const HYDRO_UNITS = ['ALL', 'DWC1', 'DWC2', 'NFT', 'AERO', 'TROUGH'];
const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thismonth', label: 'This Month' },
  { value: 'lastmonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
];

const DataExport = () => {
  // CSV Export State
  const [csvUnit, setCsvUnit] = useState('ALL');
  const [csvDateRange, setCsvDateRange] = useState('last7days');
  const [csvStartDate, setCsvStartDate] = useState('');
  const [csvEndDate, setCsvEndDate] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvStatus, setCsvStatus] = useState(null);

  // ZIP Export State
  const [zipUnit, setZipUnit] = useState('ALL');
  const [zipDateRange, setZipDateRange] = useState('last7days');
  const [zipStartDate, setZipStartDate] = useState('');
  const [zipEndDate, setZipEndDate] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [zipStatus, setZipStatus] = useState(null);

  const handleCsvExport = async () => {
    setCsvLoading(true);
    setCsvStatus(null);

    try {
      const params = new URLSearchParams({
        unit: csvUnit,
        range: csvDateRange,
        ...(csvDateRange === 'custom' && {
          startDate: csvStartDate,
          endDate: csvEndDate
        })
      });

      const response = await axios.get(`/export/sensors/csv?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sensor-data-${csvUnit}-${csvDateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setCsvStatus({
        type: 'success',
        message: 'CSV file downloaded successfully!'
      });
    } catch (error) {
      setCsvStatus({
        type: 'error',
        message: 'Failed to export CSV data. Please try again.'
      });
      console.error('CSV export error:', error);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleZipExport = async () => {
    setZipLoading(true);
    setZipStatus(null);

    try {
      const params = new URLSearchParams({
        unit: zipUnit,
        range: zipDateRange,
        ...(zipDateRange === 'custom' && {
          startDate: zipStartDate,
          endDate: zipEndDate
        })
      });

      const response = await axios.get(`/export/images/zip?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `camera-images-${zipUnit}-${zipDateRange}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setZipStatus({
        type: 'success',
        message: 'ZIP file downloaded successfully!'
      });
    } catch (error) {
      setZipStatus({
        type: 'error',
        message: 'Failed to export camera images. Please try again.'
      });
      console.error('ZIP export error:', error);
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>
          📊 Data Export
        </PageTitle>
        <PageDescription>
          Export sensor data as CSV files or camera images as ZIP archives. Select date ranges and specific hydroponic units for targeted exports.
        </PageDescription>
      </PageHeader>

      {/* CSV Export Section */}
      <ExportSection>
        <SectionTitle>
          📈 Sensor Data Export (CSV)
        </SectionTitle>
        <SectionDescription>
          Export sensor readings including pH, TDS, temperature, humidity, and water levels in CSV format for analysis.
        </SectionDescription>

        <FormGrid>
          <FormGroup>
            <Label>Hydroponic Unit</Label>
            <Select
              value={csvUnit}
              onChange={(e) => setCsvUnit(e.target.value)}
            >
              {HYDRO_UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit === 'ALL' ? 'All Units' : unit}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Date Range</Label>
            <Select
              value={csvDateRange}
              onChange={(e) => setCsvDateRange(e.target.value)}
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          {csvDateRange === 'custom' && (
            <>
              <FormGroup>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={csvStartDate}
                  onChange={(e) => setCsvStartDate(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={csvEndDate}
                  onChange={(e) => setCsvEndDate(e.target.value)}
                />
              </FormGroup>
            </>
          )}
        </FormGrid>

        <ButtonContainer>
          <ExportButton
            variant="primary"
            onClick={handleCsvExport}
            disabled={csvLoading || (csvDateRange === 'custom' && (!csvStartDate || !csvEndDate))}
          >
            {csvLoading ? <LoadingSpinner /> : '📥'}
            {csvLoading ? 'Exporting...' : 'Export CSV'}
          </ExportButton>
        </ButtonContainer>

        {csvStatus && (
          <StatusMessage type={csvStatus.type}>
            {csvStatus.message}
          </StatusMessage>
        )}
      </ExportSection>

      {/* ZIP Export Section */}
      <ExportSection>
        <SectionTitle>
          📷 Camera Images Export (ZIP)
        </SectionTitle>
        <SectionDescription>
          Export camera images as a ZIP archive. Images are organized by unit, date, and camera ID for easy browsing.
        </SectionDescription>

        <FormGrid>
          <FormGroup>
            <Label>Hydroponic Unit</Label>
            <Select
              value={zipUnit}
              onChange={(e) => setZipUnit(e.target.value)}
            >
              {HYDRO_UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit === 'ALL' ? 'All Units' : unit}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Date Range</Label>
            <Select
              value={zipDateRange}
              onChange={(e) => setZipDateRange(e.target.value)}
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          {zipDateRange === 'custom' && (
            <>
              <FormGroup>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={zipStartDate}
                  onChange={(e) => setZipStartDate(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={zipEndDate}
                  onChange={(e) => setZipEndDate(e.target.value)}
                />
              </FormGroup>
            </>
          )}
        </FormGrid>

        <ButtonContainer>
          <ExportButton
            variant="success"
            onClick={handleZipExport}
            disabled={zipLoading || (zipDateRange === 'custom' && (!zipStartDate || !zipEndDate))}
          >
            {zipLoading ? <LoadingSpinner /> : '📦'}
            {zipLoading ? 'Exporting...' : 'Export ZIP'}
          </ExportButton>
        </ButtonContainer>

        {zipStatus && (
          <StatusMessage type={zipStatus.type}>
            {zipStatus.message}
          </StatusMessage>
        )}
      </ExportSection>
    </Container>
  );
};

export default DataExport;