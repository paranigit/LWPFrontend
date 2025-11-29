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
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  TrendingUp,
  TrendingDown,
  FilterList,
  Info,
} from '@mui/icons-material';
import { strategiesAPI } from '../../api/client';
import { Strategy, StrategyCreate, FormulaCriteria, CallType } from '../../types';

// Available criteria names with descriptions
const AVAILABLE_CRITERIA = [
  { value: 'pe_ratio', label: 'P/E Ratio', description: 'Price-to-Earnings Ratio (threshold: 35)' },
  { value: 'pegy_index', label: 'PEGY Index', description: 'PEG Yield Index (threshold: 1.5)' },
  { value: '52w_range', label: '52-Week Range', description: '52-week position percentage (threshold: 28%)' },
];

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentStrategyId, setCurrentStrategyId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [filterCallType, setFilterCallType] = useState<CallType | 'ALL'>('ALL');
  
  const [formData, setFormData] = useState<StrategyCreate>({
    name: '',
    description: '',
    call_type: CallType.BUY,
    formula: [{ criteria_name: '', weight: 0 }],
  });

  useEffect(() => {
    loadData();
  }, [filterCallType]);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await strategiesAPI.getAll();
      let filteredStrategies = response.data;
      
      // Apply filter if not ALL
      if (filterCallType !== 'ALL') {
        filteredStrategies = response.data.filter(
          (strategy) => strategy.call_type === filterCallType
        );
      }
      
      setStrategies(filteredStrategies);
    } catch (error) {
      console.error('Failed to load strategies:', error);
      setError('Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: CallType | 'ALL'
  ) => {
    if (newFilter !== null) {
      setFilterCallType(newFilter);
    }
  };

  const handleOpenDialog = (strategy?: Strategy): void => {
    if (strategy) {
      setEditMode(true);
      setCurrentStrategyId(strategy.id);
      setFormData({
        name: strategy.name,
        description: strategy.description,
        call_type: strategy.call_type,
        formula: strategy.formula,
      });
    } else {
      setEditMode(false);
      setCurrentStrategyId(null);
      setFormData({
        name: '',
        description: '',
        call_type: CallType.BUY,
        formula: [{ criteria_name: '', weight: 0 }],
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setError('');
  };

  const handleAddCriteria = (): void => {
    setFormData({
      ...formData,
      formula: [...formData.formula, { criteria_name: '', weight: 0 }],
    });
  };

  const handleRemoveCriteria = (index: number): void => {
    const newFormula = formData.formula.filter((_, i) => i !== index);
    setFormData({ ...formData, formula: newFormula });
  };

  const handleCriteriaChange = (
    index: number,
    field: keyof FormulaCriteria,
    value: string | number
  ): void => {
    const newFormula = [...formData.formula];
    newFormula[index] = {
      ...newFormula[index],
      [field]: field === 'criteria_name' ? value : Number(value),
    };
    setFormData({ ...formData, formula: newFormula });
  };

  const validateFormula = (): boolean => {
    const totalWeight = formData.formula.reduce((sum, item) => sum + item.weight, 0);
    
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      setError(`Total weight must equal 1.0 (currently ${totalWeight.toFixed(2)})`);
      return false;
    }

    for (const item of formData.formula) {
      if (!item.criteria_name.trim()) {
        setError('All criteria must have a name');
        return false;
      }
      if (item.weight < 0 || item.weight > 1) {
        setError('Each weight must be between 0 and 1');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateFormula()) {
      return;
    }

    try {
      if (editMode && currentStrategyId) {
        await strategiesAPI.update(currentStrategyId, formData);
      } else {
        await strategiesAPI.create(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Failed to save strategy:', error);
      setError(error.response?.data?.detail || 'Failed to save strategy');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) {
      return;
    }

    try {
      await strategiesAPI.delete(id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete strategy:', error);
      alert(error.response?.data?.detail || 'Failed to delete strategy');
    }
  };

  const getTotalWeight = (): number => {
    return formData.formula.reduce((sum, item) => sum + item.weight, 0);
  };

  const getFilteredCount = (): string => {
    if (filterCallType === 'ALL') {
      return `${strategies.length} total`;
    }
    return `${strategies.length} ${filterCallType}`;
  };

  const getCriteriaLabel = (criteria_name: string): string => {
    const found = AVAILABLE_CRITERIA.find(c => c.value === criteria_name);
    return found ? found.label : criteria_name;
  };

  const getTargetInfo = (criteria_name: string, call_type: CallType): string => {
    const criteriaLower = criteria_name.toLowerCase().replace(' ', '_');
    
    if (call_type === CallType.BUY) {
      // For BUY: Lower values are better
      switch (criteriaLower) {
        case 'pe_ratio':
          return 'Target: <35 (lower is better)';
        case 'pegy_index':
          return 'Target: <1.5 (lower is better)';
        case '52w_range':
          return 'Target: <28% (lower is better)';
        default:
          return 'Pro-rata scoring';
      }
    } else {
      // For SELL: Higher values are better
      switch (criteriaLower) {
        case 'pe_ratio':
          return 'Target: >35 (higher is better)';
        case 'pegy_index':
          return 'Target: >1.5 (higher is better)';
        case '52w_range':
          return 'Target: >28% (higher is better)';
        default:
          return 'Pro-rata scoring';
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography variant="h6" fontWeight={700}>
          Strategies
        </Typography>
        <Tooltip title="Strategies use predefined targets based on call type. PE Ratio: 35, PEGY: 1.5, 52w Range: 28%">
          <Info fontSize="small" color="action" />
        </Tooltip>
      </Box>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <FilterList color="action" />
              <ToggleButtonGroup
                value={filterCallType}
                exclusive
                onChange={handleFilterChange}
                size="small"
              >
                <ToggleButton value="ALL">
                  All ({strategies.length})
                </ToggleButton>
                <ToggleButton value={CallType.BUY}>
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                  Buy
                </ToggleButton>
                <ToggleButton value={CallType.SELL}>
                  <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                  Sell
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="body2" color="text.secondary">
                {getFilteredCount()}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add New Strategy
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="18%">Name</TableCell>
                    <TableCell width="10%" align="center">Call Type</TableCell>
                    <TableCell width="27%">Description</TableCell>
                    <TableCell width="30%">Formula Criteria</TableCell>
                    <TableCell width="15%" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {strategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell>{strategy.name}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={strategy.call_type === CallType.BUY ? <TrendingUp /> : <TrendingDown />}
                          label={strategy.call_type}
                          color={strategy.call_type === CallType.BUY ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{strategy.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {strategy.formula.map((item, idx) => (
                            <Tooltip
                              key={idx}
                              title={getTargetInfo(item.criteria_name, strategy.call_type)}
                              arrow
                            >
                              <Chip
                                label={`${getCriteriaLabel(item.criteria_name)}: ${(item.weight * 100).toFixed(0)}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(strategy)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(strategy.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {strategies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {filterCallType === 'ALL' 
                          ? 'No strategies found. Add one to get started.'
                          : `No ${filterCallType} strategies found.`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {editMode ? 'Edit Strategy' : 'Add New Strategy'}
            </Typography>
            <Tooltip title="Targets are predefined: PE Ratio (35), PEGY (1.5), 52w Range (28%). Only set criteria names and weights.">
              <Info color="action" />
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <TextField
              label="Strategy Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Call Type"
              value={formData.call_type}
              onChange={(e) => setFormData({ ...formData, call_type: e.target.value as CallType })}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value={CallType.BUY}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="success" />
                  BUY - Lower values are better
                </Box>
              </MenuItem>
              <MenuItem value={CallType.SELL}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDown color="error" />
                  SELL - Higher values are better
                </Box>
              </MenuItem>
            </TextField>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Formula Criteria
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddCriteria}
              >
                Add Criteria
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Default Targets:</strong>
                <br />
                • P/E Ratio: threshold 35 (lower = better for BUY, higher = better for SELL)
                <br />
                • PEGY Index: threshold 1.5 (lower = better for BUY, higher = better for SELL)
                <br />
                • 52-Week Range: threshold 28% (lower = better for BUY, higher = better for SELL)
              </Typography>
            </Alert>

            {formData.formula.map((criteria, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Criteria Name</InputLabel>
                      <Select
                        value={criteria.criteria_name}
                        label="Criteria Name"
                        onChange={(e) =>
                          handleCriteriaChange(index, 'criteria_name', e.target.value)
                        }
                        required
                      >
                        {AVAILABLE_CRITERIA.map((criterion) => (
                          <MenuItem key={criterion.value} value={criterion.value}>
                            <Box>
                              <Typography variant="body2">{criterion.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {criterion.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Weight (0-1)"
                        type="number"
                        value={criteria.weight}
                        onChange={(e) =>
                          handleCriteriaChange(index, 'weight', e.target.value)
                        }
                        required
                        size="small"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        sx={{ flex: 1 }}
                        helperText={`${(criteria.weight * 100).toFixed(0)}% of total weight`}
                      />
                      {criteria.criteria_name && (
                        <Chip
                          label={getTargetInfo(criteria.criteria_name, formData.call_type)}
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ flex: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveCriteria(index)}
                    disabled={formData.formula.length === 1}
                    sx={{ ml: 1 }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Paper>
            ))}

            <Box sx={{ mt: 2, p: 2, bgcolor: getTotalWeight() === 1.0 ? 'success.light' : 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Total Weight: {getTotalWeight().toFixed(2)} / 1.00
                {Math.abs(getTotalWeight() - 1.0) > 0.01 && (
                  <Typography component="span" color="error" sx={{ ml: 1 }}>
                    (Must equal 1.00)
                  </Typography>
                )}
                {Math.abs(getTotalWeight() - 1.0) <= 0.01 && (
                  <Typography component="span" color="success.dark" sx={{ ml: 1 }}>
                    ✓ Valid
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Strategies;