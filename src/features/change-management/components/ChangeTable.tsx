import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link,
  Typography,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IChangeRequest, ISignoff } from '../types';
import { changeService } from '../api/changeService';
import { formatDisplayTime, formatDisplayDate } from '../../../utils/date';

const STATUS_CONFIG: Record<string, { color: "success" | "warning" | "error" | "default" }> = {
  released: { color: 'success' },
  approved: { color: 'success' },
  open: { color: 'warning' },
  pending: { color: 'warning' },
  canceled: { color: 'error' },
};

interface ChangeTableProps {
  data: IChangeRequest[];
  loading: boolean;
  total?: number;
}

export const ChangeTable: React.FC<ChangeTableProps> = ({ data, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof IChangeRequest>('createDate');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChangeNo, setCurrentChangeNo] = useState('');
  const [signoffs, setSignoffs] = useState<ISignoff[]>([]);
  const [isSignoffLoading, setIsSignoffLoading] = useState(false);

  // 根據關卡名稱生成固定色塊顏色 (使用差異較大的色調)
  const getStageColor = (name: string) => {
    const colors = [
      '#E3F2FD', // 藍
      '#F1F8E9', // 綠
      '#F3E5F5', // 紫
      '#E0F7FA', // 靛藍/青
      '#FFFDE7', // 黃
      '#E8EAF6', // 淺靛藍
      '#EFEBE9', // 褐
      '#F9FBE7', // 萊姆
      '#E0F2F1', // 湖水綠
      '#E1F5FE', // 淺藍
      '#F0F4C3', // 淺檸檬
      '#B2EBF2'  // 淺青
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      // 增加 hash 的複雜度
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0; // 轉換為 32 位元整數
    }
    // 使用質數來增加隨機分佈感
    const index = Math.abs(hash * 31) % colors.length;
    return colors[index];
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = a[orderBy] || '';
      const valB = b[orderBy] || '';
      return order === 'desc' 
        ? (valB < valA ? -1 : 1)
        : (valB < valA ? 1 : -1);
    });
  }, [data, order, orderBy]);

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleShowSignoffs = async (changeNo: string) => {
    setCurrentChangeNo(changeNo);
    setIsModalOpen(true);
    setIsSignoffLoading(true);
    try {
      const result = await changeService.getSignoffs(changeNo);
      // 1. 過濾掉簽核人為空、'-' 或管理員帳號 (admin, administrator)
      // 2. 當前關卡 (isCurrentStatus === 1) 永遠排在最後
      // 3. 其餘關卡根據結束時間由早到晚排序
      const filtered = result.filter(s => {
        if (!s.signerName || s.signerName === '-') return false;
        const name = s.signerName.toLowerCase();
        return !name.includes('admin') && !name.includes('administrator');
      });
      const sorted = [...filtered].sort((a, b) => {
        if (a.isCurrentStatus !== b.isCurrentStatus) {
          return a.isCurrentStatus - b.isCurrentStatus;
        }
        if (!a.endTime && !b.endTime) return 0;
        if (!a.endTime) return 1;
        if (!b.endTime) return -1;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });
      setSignoffs(sorted);
    } catch (e) {
      console.error('Failed to fetch signoffs');
    } finally {
      setIsSignoffLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e4e8', borderRadius: 3 }}>
        <Table sx={{ minWidth: 'max-content' }} size="small">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              {[
                { id: 'changeNumber', label: '表單單號' },
                { id: 'description', label: '表單描述' },
                { id: 'workflow', label: '流程名稱' },
                { id: 'status', label: '狀態' },
                { id: 'createDate', label: '申請日期' },
                { id: 'originator', label: '發起人' },
              ].map((cell) => (
                <TableCell key={cell.id} sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === cell.id}
                    direction={orderBy === cell.id ? order : 'asc'}
                    onClick={() => {
                      const isAsc = orderBy === cell.id && order === 'asc';
                      setOrder(isAsc ? 'desc' : 'asc');
                      setOrderBy(cell.id as keyof IChangeRequest);
                    }}
                  >
                    {cell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : paginatedData.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell><Link component="button" onClick={() => handleShowSignoffs(item.changeNumber)} sx={{ fontWeight: 700, textDecoration: 'none' }}>{item.changeNumber}</Link></TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</Typography></TableCell>
                <TableCell>{item.workflow}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={STATUS_CONFIG[item.status.toLowerCase()]?.color || 'default'} 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>{formatDisplayDate(item.createDate)}</TableCell>
                <TableCell>{item.originator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          簽核流程 - {currentChangeNo}
          <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead><TableRow><TableCell>關卡</TableCell><TableCell>簽核人</TableCell><TableCell>結束時間</TableCell></TableRow></TableHead>
            <TableBody>
              {isSignoffLoading ? <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={20} /></TableCell></TableRow> :
                signoffs.map((s, i) => {
                  const stageBgColor = getStageColor(s.statusName);
                  const isCurrent = s.isCurrentStatus === 1;
                  
                  return (
                    <TableRow 
                      key={i} 
                      sx={{ 
                        backgroundColor: isCurrent ? 'rgba(211, 47, 47, 0.04)' : stageBgColor,
                        '&:hover': {
                          backgroundColor: isCurrent ? 'rgba(211, 47, 47, 0.08) !important' : `${stageBgColor}cc !important`,
                        }
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: isCurrent ? 800 : 500,
                          color: isCurrent ? 'error.main' : 'inherit',
                          borderLeft: isCurrent ? '4px solid #d32f2f' : 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isCurrent && <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />}
                        {s.statusName}
                      </TableCell>
                      <TableCell sx={{ fontWeight: isCurrent ? 700 : 400 }}>{s.signerName}</TableCell>
                      <TableCell sx={{ color: isCurrent ? 'error.light' : 'text.secondary', fontSize: '0.875rem' }}>
                        {(s.endTime && !isCurrent) ? formatDisplayTime(s.endTime) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setIsModalOpen(false)}>關閉</Button></DialogActions>
      </Dialog>
    </Box>
  );
};