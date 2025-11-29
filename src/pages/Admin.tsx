import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Delete } from '@mui/icons-material';
import {
  adminAPI,
  stockAPI,
  etfAPI,
  bondAPI,
  mutualFundAPI,
  industriesAPI,
} from '../api/client';
import {
  AllowedEmail,
  StockSymbol,
  ETFSymbol,
  Bond,
  MutualFund,
  CurrencyCode,
  AssetType,
  UserRole,
  Industry,
} from '../types';

type DialogType = 'email' | 'stock' | 'etf' | 'bond' | 'mutualfund' | 'industry' | '';

const Admin: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [stocks, setStocks] = useState<StockSymbol[]>([]);
  const [etfs, setEtfs] = useState<ETFSymbol[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<DialogType>('');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
    loadIndustries();
  }, [tab]);

  const loadIndustries = async (): Promise<void> => {
    try {
      const industriesRes = await industriesAPI.getAll();
      setIndustries(industriesRes.data);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  };

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      switch (tab) {
        case 0:
          const emailsRes = await adminAPI.getAllowedEmails();
          setAllowedEmails(emailsRes.data);
          break;
        case 1:
          const stocksRes = await stockAPI.getAll();
          console.log(stocksRes.data)
          setStocks(stocksRes.data);
          break;
        case 2:
          const etfsRes = await etfAPI.getAll();
          setEtfs(etfsRes.data);
          break;
        case 3:
          const bondsRes = await bondAPI.getAll();
          setBonds(bondsRes.data);
          break;
        case 4:
          const mfsRes = await mutualFundAPI.getAll();
          setMutualFunds(mfsRes.data);
          break;
        case 5:
          const industriesRes = await industriesAPI.getAll();
          setIndustries(industriesRes.data);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: DialogType): void => {
    setDialogType(type);
    // Initialize form data with default currency
    setFormData({
      currency: CurrencyCode.INR,
      asset_type: type === 'stock' ? AssetType.STOCK : undefined,
      role: type === 'email' ? UserRole.RECOMMENDATION_ONLY : undefined,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setDialogType('');
    setFormData({});
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      console.log(formData);
      switch (dialogType) {
        case 'email':
          await adminAPI.addAllowedEmail(formData);
          break;
        case 'stock':
          await stockAPI.create(formData);
          break;
        case 'etf':
          await etfAPI.create(formData);
          break;
        case 'bond':
          await bondAPI.create(formData);
          break;
        case 'mutualfund':
          await mutualFundAPI.create(formData);
          break;
        case 'industry':
          await industriesAPI.create(formData);
          break;
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDeleteEmail = async (email: string): Promise<void> => {
    if (window.confirm('Are you sure you want to remove this email?')) {
      try {
        await adminAPI.deleteAllowedEmail(email);
        loadData();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const emailColumns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      renderCell: (params) => {
        const role = params.value as UserRole;
        switch (role) {
          case UserRole.ADMIN:
            return 'Admin (Full Access)';
          case UserRole.VIEWER:
            return 'Viewer (View Only)';
          case UserRole.RECOMMENDATION_ONLY:
            return 'Recommendation Only';
          default:
            return role;
        }
      },
    },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      renderCell: (params) => (!params.value ? '' : new Date(params.value).toLocaleString())
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteEmail(params.row.email)}
          color="error"
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const symbolColumns: GridColDef[] = [
    { field: 'symbol', headerName: 'Symbol', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sector_industry', headerName: 'Industry', width: 350 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'exchange', headerName: 'Exchange', width: 120 },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      renderCell: (params) => (!params.value ? '' : new Date(params.value).toLocaleString())
    },
  ];

  const bondColumns: GridColDef[] = [
    { field: 'isin', headerName: 'ISIN', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sector_industry', headerName: 'Industry', width: 350 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'coupon_rate', headerName: 'Coupon Rate', width: 120 },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      renderCell: (params) => (!params.value ? '' : new Date(params.value).toLocaleString())
    },
  ];

  const mutualFundColumns: GridColDef[] = [
    { field: 'isin', headerName: 'ISIN', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sector_industry', headerName: 'Industry', width: 350 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'fund_house', headerName: 'Fund House', width: 200 },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      renderCell: (params) => (!params.value ? '' : new Date(params.value).toLocaleString())
    },
  ];

  const industryColumns: GridColDef[] = [
    { field: 'sector', headerName: 'Sector', width: 300 },
    { field: 'industry', headerName: 'Industry', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Added On',
      width: 180,
      renderCell: (params) => (!params.value ? '' : new Date(params.value).toLocaleString())
    },
  ];

  const renderDialogContent = (): React.ReactElement => {
    switch (dialogType) {
      case 'email':
        return (
          <>
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
          </>
        );

      case 'stock':
      case 'etf':
        return (
          <>
            <TextField
              label="Symbol"
              value={formData.symbol || ''}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              fullWidth
              required
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
          </>
        );

      case 'bond':
        return (
          <>
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
          </>
        );

      case 'mutualfund':
        return (
          <>
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
              label="Fund House"
              value={formData.fund_house || ''}
              onChange={(e) => setFormData({ ...formData, fund_house: e.target.value })}
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
          </>
        );

      case 'industry':
        return (
          <>
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
              sx={{ mb: 2 }}
              placeholder="e.g., Software, Biotechnology, Banking"
            />
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </>
        );

      default:
        return <></>;
    }
  };

  // Add getRowId prop for DataGrids with non-standard IDs
  const getEmailRowId = (row: AllowedEmail) => row.email;
  const getSymbolRowId = (row: StockSymbol | ETFSymbol) => row.symbol;
  const getBondRowId = (row: Bond) => row.isin;
  const getMutualFundRowId = (row: MutualFund) => row.isin;

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Admin Panel
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)}>
          <Tab label="Allowed Emails" />
          <Tab label="Stocks" />
          <Tab label="ETFs" />
          <Tab label="Bonds" />
          <Tab label="Mutual Funds" />
          <Tab label="Industries" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                const types: DialogType[] = [
                  'email',
                  'stock',
                  'etf',
                  'bond',
                  'mutualfund',
                  'industry',
                ];
                handleOpenDialog(types[tab]);
              }}
            >
              Add New
            </Button>
          </Box>

          {tab === 0 && (
            <DataGrid
              rows={allowedEmails}
              columns={emailColumns}
              getRowId={getEmailRowId}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
          {tab === 1 && (
            <DataGrid
              rows={stocks}
              columns={symbolColumns}
              getRowId={getSymbolRowId}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
          {tab === 2 && (
            <DataGrid
              rows={etfs}
              columns={symbolColumns}
              getRowId={getSymbolRowId}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
          {tab === 3 && (
            <DataGrid
              rows={bonds}
              columns={bondColumns}
              getRowId={getBondRowId}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
          {tab === 4 && (
            <DataGrid
              rows={mutualFunds}
              columns={mutualFundColumns}
              getRowId={getMutualFundRowId}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
          {tab === 5 && (
            <DataGrid
              rows={industries}
              columns={industryColumns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>{renderDialogContent()}</Box>
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

export default Admin;