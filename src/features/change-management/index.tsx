import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Stack, 
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { SearchFilter } from './components/SearchFilter';
import { ChangeTable } from './components/ChangeTable';
import { useChangeOptions } from './hooks/useChangeOptions';
import { useChangeSearch } from './hooks/useChangeSearch';
import { changeService } from './api/changeService';
import { IChangeSearchParams } from './types';

const ChangeManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<IChangeSearchParams>({
    keyword: '',
    changeNumber: '',
    startDate: '2026-01-01',
    endDate: '2026-02-09',
  });

  // 僅儲存生效中的搜尋參數
  const [activeParams, setActiveParams] = useState<IChangeSearchParams | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { formTypes, businessUnits, isLoading: isOptionsLoading, isError: isOptionsError } = useChangeOptions();
  
  // 只有當 activeParams 存在時才啟動查詢
  const { data: searchResults, isLoading: isSearchLoading, isError: isSearchError } = 
    useChangeSearch(activeParams!, !!activeParams);

  const hasAnyError = isOptionsError || isSearchError;
  const isDateSelected = !!filters.startDate && !!filters.endDate;

  const handleFilterChange = (newFilters: Partial<IChangeSearchParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = () => {
    if (!isDateSelected) return;
    setActiveParams({ ...filters });
  };

  const handleExport = async () => {
    if (!isDateSelected) return;
    setIsExporting(true);
    try {
      await changeService.exportChangeSignoffs(filters);
    } catch (e) {
      console.error('Export failed', e);
      // 錯誤會由全域攔截器彈出提示，這裡只需停止 Loading
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" color="textPrimary" sx={{ mb: 1 }}>表單流程查詢</Typography>
            <Typography variant="body1" color="textSecondary">Agile PLM 系統變更單據與簽核狀態查詢</Typography>
            <Divider sx={{ mt: 3 }} />
          </Box>

          <Box>
            {!isDateSelected && (
              <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                查詢提示：請選擇「申請日期區間」以進行搜尋。
              </Alert>
            )}

            {hasAnyError && (
              <Alert icon={<ErrorOutlineIcon fontSize="inherit" />} severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                系統連線異常：目前顯示的是示範資料，請稍後再試或聯繫管理員。
              </Alert>
            )}
            
            <SearchFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onExport={handleExport}
              isLoading={isSearchLoading}
              isExporting={isExporting}
              isSearchDisabled={!isDateSelected}
              options={{
                formTypes,
                businessUnits,
                isLoading: isOptionsLoading,
              }}
            />

            <ChangeTable
              data={searchResults?.items || []} 
              loading={isSearchLoading}
              total={searchResults?.total || 0}
            />
          </Box>

          <Box sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Agile PLM Change Management Workflow Query System © 2026
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ChangeManagementPage;
