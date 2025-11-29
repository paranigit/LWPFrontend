import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  PieChart as PieChartIcon,
  Loyalty,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardAPI } from '../api/client';
import { DashboardSummary, CurrencyCode, AssetType } from '../types';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

const ASSET_ICONS: Record<AssetType, React.ReactElement> = {
  [AssetType.STOCK]: <ShowChart />,
  [AssetType.ETF]: <PieChartIcon />,
  [AssetType.BOND]: <AccountBalance />,
  [AssetType.MUTUAL_FUND]: <Loyalty />,
};

interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const Dashboard: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>(CurrencyCode.INR);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSummary();
  }, [currency]);

  const loadSummary = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary(currency);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (_event: React.MouseEvent<HTMLElement>, newCurrency: CurrencyCode | null): void => {
    if (newCurrency) {
      setCurrency(newCurrency);
    }
  };

  const formatCurrency = (amount: number): string => {
    const symbol = currency === CurrencyCode.INR ? '₹' : '$';
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return (
      <Container>
        <Typography variant="h6" color="text.secondary">
          No portfolio data available
        </Typography>
      </Container>
    );
  }

  const pieChartData: PieChartData[] = summary.asset_summaries.map((asset) => ({
    name: asset.asset_type,
    value: asset.current_value,
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700}>
          Portfolio Dashboard
        </Typography>
        <ToggleButtonGroup
          value={currency}
          exclusive
          onChange={handleCurrencyChange}
          size="small"
        >
          <ToggleButton value={CurrencyCode.INR}>INR</ToggleButton>
          <ToggleButton value={CurrencyCode.USD}>USD</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Investment
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(summary.total_investment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(summary.current_value)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Profit/Loss
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="h5"
                  fontWeight={600}
                  color={summary.total_profit_loss >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.total_profit_loss)}
                </Typography>
                {summary.total_profit_loss >= 0 ? (
                  <TrendingUp color="success" sx={{ ml: 1 }} />
                ) : (
                  <TrendingDown color="error" sx={{ ml: 1 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Return %
              </Typography>
              <Typography
                variant="h5"
                fontWeight={600}
                color={summary.total_profit_loss_percentage >= 0 ? 'success.main' : 'error.main'}
              >
                {formatPercentage(summary.total_profit_loss_percentage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Asset Breakdown */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Asset Breakdown
            </Typography>
            <Grid container spacing={2} mt={1}>
              {summary.asset_summaries.map((asset, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={asset.asset_type}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box
                          sx={{
                            color: COLORS[index % COLORS.length],
                            mr: 1,
                          }}
                        >
                          {ASSET_ICONS[asset.asset_type]}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {asset.asset_type.replace('_', ' ')}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Investment: {formatCurrency(asset.total_investment)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current: {formatCurrency(asset.current_value)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={asset.profit_loss >= 0 ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {formatCurrency(asset.profit_loss)} (
                        {formatPercentage(asset.profit_loss_percentage)})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {asset.count} holdings
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Portfolio Distribution Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Portfolio Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;