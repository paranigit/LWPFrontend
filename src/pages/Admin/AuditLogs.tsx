import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { auditLogsAPI } from '../../api/client';

interface AuditLog {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  source: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  details: any;
  success: boolean;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditStats {
  total_logs: number;
  failed_actions: number;
  unique_users: number;
  actions_by_type: { [key: string]: number };
  actions_by_source: { [key: string]: number };
  recent_activity_24h: number;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(25);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, pageSize, actionFilter, sourceFilter, entityTypeFilter, successFilter, userIdFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: pageSize,
        offset: page * pageSize,
      };

      if (actionFilter) params.action = actionFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (entityTypeFilter) params.entity_type = entityTypeFilter;
      if (successFilter !== '') params.success = successFilter === 'true';
      if (userIdFilter) params.user_id = parseInt(userIdFilter);

      const response = await auditLogsAPI.getAll(params);
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await auditLogsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load audit stats:', error);
    }
  };

  const handleClearFilters = () => {
    setActionFilter('');
    setSourceFilter('');
    setEntityTypeFilter('');
    setSuccessFilter('');
    setUserIdFilter('');
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    if (action.includes('CREATED')) return 'success';
    if (action.includes('DELETED')) return 'error';
    if (action.includes('UPDATED')) return 'primary';
    if (action.includes('FAILED')) return 'error';
    if (action.includes('LOGIN')) return 'primary';
    if (action.includes('LOGOUT')) return 'default';
    return 'default';
  };

  const getSourceColor = (source: string): 'default' | 'primary' | 'secondary' | 'info' => {
    switch (source) {
      case 'WEB_UI': return 'primary';
      case 'API': return 'secondary';
      case 'SCHEDULER': return 'info';
      case 'SYSTEM': return 'default';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'user_email',
      headerName: 'User',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value || 'SYSTEM'}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getActionColor(params.value)}
        />
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getSourceColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'entity_type',
      headerName: 'Entity Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'entity_id',
      headerName: 'Entity ID',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" fontWeight={600}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value} arrow>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'success',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Tooltip title={params.row.error_message || 'Failed'}>
            <ErrorIcon color="error" fontSize="small" />
          </Tooltip>
        )
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700}>
          Audit Logs
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            loadLogs();
            loadStats();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Total Logs
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total_logs.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Failed Actions
                </Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {stats.failed_actions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Unique Users
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.unique_users.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Last 24 Hours
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.recent_activity_24h.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Filters
          </Typography>
          <Box flexGrow={1} />
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select
                value={sourceFilter}
                label="Source"
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="WEB_UI">Web UI</MenuItem>
                <MenuItem value="API">API</MenuItem>
                <MenuItem value="SCHEDULER">Scheduler</MenuItem>
                <MenuItem value="SYSTEM">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityTypeFilter}
                label="Entity Type"
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="etf">ETF</MenuItem>
                <MenuItem value="bond">Bond</MenuItem>
                <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={successFilter}
                label="Status"
                onChange={(e) => setSuccessFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Success</MenuItem>
                <MenuItem value="false">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              type="number"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Logs Table */}
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={logs}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={total}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              padding: '8px',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
            },
            '& .MuiDataGrid-columnHeader': {
              color: 'primary.main',
            },
            '.MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold !important',
            },
          }}
        />
      </Paper>
    </Container>
  );
};

export default AuditLogs;