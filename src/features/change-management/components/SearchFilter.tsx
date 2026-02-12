import React from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Autocomplete,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import { IOption, IChangeSearchParams } from '../types';

interface SearchFilterProps {
  filters: IChangeSearchParams;
  onFilterChange: (newFilters: Partial<IChangeSearchParams>) => void;
  onSearch: () => void;
  onExport: () => void;
  isLoading: boolean;
  isExporting: boolean;
  isSearchDisabled?: boolean;
  options: {
    formTypes: IOption[];
    businessUnits: IOption[];
    isLoading: boolean;
  };
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onExport,
  isLoading,
  isExporting,
  isSearchDisabled,
  options,
}) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e0e4e8', borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          
          <Autocomplete
            sx={{ minWidth: 200, flex: '1 1 auto' }}
            options={options.formTypes}
            getOptionLabel={(option) => option.label}
            value={options.formTypes.find(opt => opt.value === filters.formType) || null}
            onChange={(_, newValue) => onFilterChange({ formType: newValue?.value })}
            loading={options.isLoading}
            renderInput={(params) => <TextField {...params} label="表單類型" variant="outlined" size="small" />}
          />

          <Autocomplete
            sx={{ minWidth: 250, flex: '1 1 auto' }}
            options={options.businessUnits}
            getOptionLabel={(option) => option.label}
            value={options.businessUnits.find(opt => opt.value === filters.businessUnit) || null}
            onChange={(_, newValue) => onFilterChange({ businessUnit: newValue?.value })}
            loading={options.isLoading}
            renderInput={(params) => <TextField {...params} label="事業部" variant="outlined" size="small" />}
          />

          <TextField
            sx={{ minWidth: 150, flex: '1 1 auto' }}
            label="表單單號"
            placeholder="如: APA..."
            variant="outlined"
            size="small"
            value={filters.changeNumber || ""}
            onChange={(e) => onFilterChange({ changeNumber: e.target.value })}
          />

          {/* 開始日期 */}
          <Box sx={{ minWidth: 160, flex: '1 1 auto' }}>
            <DatePicker
              label="開始日期"
              value={filters.startDate ? dayjs(filters.startDate) : null}
              onChange={(date) => onFilterChange({ startDate: date?.format('YYYY-MM-DD') })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

          {/* 結束日期 */}
          <Box sx={{ minWidth: 160, flex: '1 1 auto' }}>
            <DatePicker
              label="結束日期"
              value={filters.endDate ? dayjs(filters.endDate) : null}
              onChange={(date) => onFilterChange({ endDate: date?.format('YYYY-MM-DD') })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

          <TextField
            sx={{ minWidth: 250, flex: '2 1 auto' }}
            label="關鍵字描述"
            placeholder="輸入描述..."
            variant="outlined"
            size="small"
            value={filters.keyword || ""}
            onChange={(e) => onFilterChange({ keyword: e.target.value })}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            disabled={isSearchDisabled || isLoading}
            sx={{ height: 40, px: 4, minWidth: 100, boxShadow: 'none', borderRadius: 2 }}
          >
            {isLoading ? "搜尋中..." : "查詢"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onExport}
            disabled={isSearchDisabled || isExporting}
            sx={{ height: 40, px: 4, minWidth: 100, borderRadius: 2 }}
          >
            {isExporting ? "匯出中..." : "匯出報表"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};