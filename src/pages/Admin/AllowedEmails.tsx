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
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Delete } from '@mui/icons-material';
import { adminAPI } from '../../api/client';
import { AllowedEmail, UserRole } from '../../types';

const AllowedEmails: React.FC = () => {
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    email: '',
    role: UserRole.RECOMMENDATION_ONLY,
    is_admin: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllowedEmails();
      setAllowedEmails(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (): void => {
    setFormData({
      email: '',
      role: UserRole.RECOMMENDATION_ONLY,
      is_admin: false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setFormData({
      email: '',
      role: UserRole.RECOMMENDATION_ONLY,
      is_admin: false,
    });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await adminAPI.addAllowedEmail(formData);
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (email: string): Promise<void> => {
    if (window.confirm('Are you sure you want to remove this email?')) {
      try {
        await adminAPI.deleteAllowedEmail(email);
        loadData();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      valueGetter: (value: UserRole) => {
        switch (value) {
          case UserRole.ADMIN:
            return 'Admin (Full Access)';
          case UserRole.VIEWER:
            return 'Viewer (View Only)';
          case UserRole.RECOMMENDATION_ONLY:
            return 'Recommendation Only';
          default:
            return value;
        }
      },
    },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      valueGetter: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDelete(params.row.email)}
          color="error"
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

const getRowId = (row: AllowedEmail) => row.email;

return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Allowed Emails
      </Typography>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
              Add New Email
            </Button>
          </Box>

          <DataGrid
            rows={allowedEmails}
            columns={columns}
            getRowId={getRowId}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>User Role</InputLabel>
              <Select
                value={formData.role || UserRole.RECOMMENDATION_ONLY}
                label="User Role"
                onChange={(e) => {
                  const selectedRole = e.target.value as UserRole;
                  setFormData({
                    ...formData,
                    role: selectedRole,
                    is_admin: selectedRole === UserRole.ADMIN,
                  });
                }}
              >
                <MenuItem value={UserRole.RECOMMENDATION_ONLY}>
                  Recommendation Only (Default)
                </MenuItem>
                <MenuItem value={UserRole.VIEWER}>Viewer (View All Pages, No Edit)</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin (Full Access)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {formData.role === UserRole.RECOMMENDATION_ONLY &&
                '• Can only view Recommendations page'}
              {formData.role === UserRole.VIEWER &&
                '• Can view all pages except Admin (read-only)'}
              {formData.role === UserRole.ADMIN &&
                '• Full access to all features including create/edit/delete'}
            </Typography>
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

export default AllowedEmails;