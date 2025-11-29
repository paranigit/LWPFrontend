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
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { industriesAPI } from '../../api/client';
import { Industry } from '../../types';

const Industries: React.FC = () => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [formData, setFormData] = useState<any>({
    sector: '',
    industry: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await industriesAPI.getAll();
      setIndustries(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (): void => {
    setEditMode(false);
    setSelectedIndustry(null);
    setFormData({
      sector: '',
      industry: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (industry: Industry): void => {
    setEditMode(true);
    setSelectedIndustry(industry);
    setFormData({
      sector: industry.sector,
      industry: industry.industry,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedIndustry(null);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (editMode && selectedIndustry) {
        await industriesAPI.update(selectedIndustry.id, formData);
      } else {
        await industriesAPI.create(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this industry?')) {
      return;
    }

    try {
      await industriesAPI.delete(id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const columns: GridColDef[] = [
    { field: 'sector', headerName: 'Sector', width: 250, flex: 1 },
    { field: 'industry', headerName: 'Industry', width: 300, flex: 1 },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value as string).toLocaleDateString();
      },
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
              onClick={() => handleOpenEditDialog(params.row as Industry)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Industries
      </Typography>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
              Add New Industry
            </Button>
          </Box>

          <DataGrid
            rows={industries}
            columns={columns}
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
        <DialogTitle>{editMode ? 'Edit Industry' : 'Add New Industry'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Sector"
              value={formData.sector || ''}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
              placeholder="e.g., Technology, Healthcare, Finance"
            />
            <TextField
              label="Industry"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Software, Biotechnology, Banking"
            />
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

export default Industries;