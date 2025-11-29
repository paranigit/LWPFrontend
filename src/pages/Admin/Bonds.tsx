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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { bondAPI, industriesAPI } from '../../api/client';
import { Bond, CurrencyCode, Industry } from '../../types';

const Bonds: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    isin: '',
    currency: CurrencyCode.INR,
    coupon_rate: '',
    industry_id: undefined,
  });

  useEffect(() => {
    loadData();
    loadIndustries();
  }, []);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await bondAPI.getAll();
      setBonds(response.data);
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
    setFormData({
      name: '',
      isin: '',
      currency: CurrencyCode.INR,
      coupon_rate: '',
      industry_id: undefined,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await bondAPI.create(formData);
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const columns: GridColDef[] = [
    { field: 'isin', headerName: 'ISIN', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sector_industry', headerName: 'Industry', width: 300 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'coupon_rate', headerName: 'Coupon Rate', width: 120 },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
  ];

  const getRowId = (row: Bond) => row.isin;

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Bonds
      </Typography>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
              Add New Bond
            </Button>
          </Box>

          <DataGrid
            rows={bonds}
            columns={columns}
            getRowId={getRowId}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Bond</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="ISIN"
              value={formData.isin || ''}
              onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
              fullWidth
              required
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
              label="Coupon Rate (%)"
              type="number"
              value={formData.coupon_rate || ''}
              onChange={(e) =>
                setFormData({ ...formData, coupon_rate: parseFloat(e.target.value) })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Industry (Optional)"
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
              <MenuItem value="">None</MenuItem>
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
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bonds;