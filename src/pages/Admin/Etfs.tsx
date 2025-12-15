import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { etfAPI, industriesAPI } from '../../api/client';
import { ETFSymbol, CurrencyCode, Industry } from '../../types';

const Etfs: React.FC = () => {
  const [etfs, setEtfs] = useState<ETFSymbol[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedEtf, setSelectedEtf] = useState<ETFSymbol | null>(null);
  const [formData, setFormData] = useState<any>({
    symbol: '',
    name: '',
    currency: CurrencyCode.INR,
    exchange: '',
    industry_id: undefined,
  });

  useEffect(() => {
    loadData();
    loadIndustries();
  }, []);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await etfAPI.getAll();
      setEtfs(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIndustries = async (): Promise<void> => {
    try {
      const response = await industriesAPI.getAll();
      setIndustries(response.data);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  };

  const handleOpenDialog = (): void => {
    setEditMode(false);
    setSelectedEtf(null);
    setFormData({
      symbol: '',
      name: '',
      currency: CurrencyCode.INR,
      exchange: '',
      industry_id: undefined,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (etf: ETFSymbol): void => {
    setEditMode(true);
    setSelectedEtf(etf);
    setFormData({
      symbol: etf.symbol,
      name: etf.name || '',
      currency: etf.currency,
      exchange: etf.exchange || '',
      industry_id: etf.industry_id || undefined,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedEtf(null);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      // Trim all string values to remove leading/trailing spaces
      const trimmedData = {
        ...formData,
        symbol: formData.symbol?.trim().toUpperCase() || '',
        name: formData.name?.trim() || '',
        exchange: formData.exchange?.trim() || '',
      };

      if (editMode && selectedEtf) {
        await etfAPI.update(selectedEtf.symbol, trimmedData);
      } else {
        await etfAPI.create(trimmedData);
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (symbol: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ETF ${symbol}?`)) {
      return;
    }

    try {
      await etfAPI.delete(symbol);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert(error.response?.data?.detail || 'Failed to delete');
    }
  };

  // Helper function to calculate days difference
  const getDaysAgo = (date: string | null): string => {
    if (!date) return '';
    
    const priceDate = new Date(date);
    const now = new Date();
    
    // Reset time to midnight for accurate day comparison
    priceDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - priceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 0) {
      return 'Future date';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const columns: GridColDef[] = [
    { field: 'symbol', headerName: 'Symbol', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sector_industry', headerName: 'Industry', width: 250 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'exchange', headerName: 'Exchange', width: 120 },
    {
      field: 'price_last_updated',
      headerName: 'Last Price Update',
      width: 180,
      renderCell: (params) => getDaysAgo(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row as ETFSymbol)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.symbol)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getRowId = (row: ETFSymbol) => row.symbol;

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        ETFs
      </Typography>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
              Add New ETF
            </Button>
          </Box>

          <DataGrid
            rows={etfs}
            columns={columns}
            getRowId={getRowId}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit ETF' : 'Add New ETF'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Symbol"
              value={formData.symbol || ''}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              fullWidth
              required
              disabled={editMode}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Currency"
              value={formData.currency || CurrencyCode.INR}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value={CurrencyCode.INR}>INR</MenuItem>
              <MenuItem value={CurrencyCode.USD}>USD</MenuItem>
            </TextField>
            <TextField
              label="Exchange"
              value={formData.exchange || ''}
              onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Industry"
              value={formData.industry_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industry_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Select</MenuItem>
              {industries.map((industry) => (
                <MenuItem key={industry.id} value={industry.id}>
                  {industry.sector} - {industry.industry}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Etfs;