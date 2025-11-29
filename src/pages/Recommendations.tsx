import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  LinearProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
  Refresh,
} from '@mui/icons-material';
import { recommendationsAPI } from '../api/client';
import { Recommendation } from '../types';

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Filters
  const [recommendationTypeFilter, setRecommendationTypeFilter] = useState<string>('ALL');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('ALL');

  // Responsive detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchRecommendations();
  }, [recommendationTypeFilter, assetTypeFilter]);

  const fetchRecommendations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {};
      
      if (recommendationTypeFilter !== 'ALL') {
        filters.recommendation_type = recommendationTypeFilter;
      }

      if (assetTypeFilter !== 'ALL') {
        filters.asset_type = assetTypeFilter;
      }

      const response = await recommendationsAPI.getAll(filters);
      setRecommendations(response.data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp sx={{ fontSize: 18 }} />;
      case 'SELL':
        return <TrendingDown sx={{ fontSize: 18 }} />;
      case 'HOLD':
        return <TrendingFlat sx={{ fontSize: 18 }} />;
      default:
        return <Info sx={{ fontSize: 18 }} />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'success';
      case 'SELL':
        return 'error';
      case 'HOLD':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatStrategy = (strategy: string): string => {
    return strategy.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#4caf50';
    if (confidence >= 60) return '#ff9800';
    return '#f44336';
  };

  // Mobile columns - only show essential info
  const mobileColumns: GridColDef[] = [
    {
      field: 'symbol',
      headerName: 'Symbol',
      flex: 1,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.symbol}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.exchange}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'recommendation_type',
      headerName: 'Type',
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={getRecommendationIcon(params.value)}
          label={params.value}
          color={getRecommendationColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'target_price',
      headerName: 'Target',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          {formatCurrency(params.value, params.row.currency)}
        </Typography>
      ),
    },
    {
      field: 'expires_at',
      headerName: 'Expires',
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Typography variant="caption" color="warning.main">
            {new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        )
      ),
    },
  ];

  // Desktop columns - show all info
  const desktopColumns: GridColDef[] = [
    {
      field: 'symbol',
      headerName: 'Symbol',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.symbol}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.exchange}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'recommendation_type',
      headerName: 'Type',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={getRecommendationIcon(params.value)}
          label={params.value}
          color={getRecommendationColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'asset_type',
      headerName: 'Asset',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'strategy',
      headerName: 'Strategy',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value} placement="top">
          <Typography variant="body2" noWrap>
            {formatStrategy(params.value)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'target_price',
      headerName: 'Target Price',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          {formatCurrency(params.value, params.row.currency)}
        </Typography>
      ),
    },
    {
      field: 'confidence_score',
      headerName: 'Confidence',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: getConfidenceColor(params.value) }}>
              {params.value}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getConfidenceColor(params.value),
              }
            }}
          />
        </Box>
      ),
    },
    {
      field: 'reasoning',
      headerName: 'Analysis',
      flex: 1,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip 
          title={
            <Box sx={{ whiteSpace: 'pre-line', maxWidth: 500 }}>
              {params.value}
            </Box>
          } 
          placement="top"
        >
          <Box 
            sx={{ 
              whiteSpace: 'pre-line',
              py: 1,
              width: '100%',
            }}
          >
            <Typography variant="body2">
              {params.value}
            </Typography>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'expires_at',
      headerName: 'Expires',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Typography variant="caption" color="warning.main">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        )
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Investment Recommendations
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Recommendation Type Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Recommendation Type</InputLabel>
            <Select
              value={recommendationTypeFilter}
              label="Recommendation Type"
              onChange={(e) => setRecommendationTypeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
              <MenuItem value="HOLD">Hold</MenuItem>
            </Select>
          </FormControl>

          {/* Asset Type Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={assetTypeFilter}
              label="Asset Type"
              onChange={(e) => setAssetTypeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Assets</MenuItem>
              <MenuItem value="STOCK">Stock</MenuItem>
              <MenuItem value="ETF">ETF</MenuItem>
              <MenuItem value="BOND">Bond</MenuItem>
              <MenuItem value="MUTUAL_FUND">Mutual Fund</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={fetchRecommendations}
            disabled={loading}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" color="text.secondary">
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* DataGrid */}
      <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={recommendations}
          columns={isMobile ? mobileColumns : desktopColumns}
          getRowId={(row) => row.symbol}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: isMobile ? 10 : 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'confidence_score', sort: 'desc' }],
            },
          }}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              py: 1.5,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Paper>
    </Container>
  );
};

export default Recommendations;