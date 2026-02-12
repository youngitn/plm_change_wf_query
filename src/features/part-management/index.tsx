import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { usePartSearch, usePartBOM } from './hooks/usePartSearch';

const PartManagementPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  
  // BOM Dialog 狀態
  const [selectedPart, setSelectedPart] = useState<{ number: string; desc: string } | null>(null);
  const [isBomOpen, setIsBomOpen] = useState(false);

  const { data: parts, isLoading } = usePartSearch(
    { keyword: searchTrigger }, 
    !!searchTrigger
  );

  const { data: bomData, isLoading: isBomLoading } = usePartBOM(
    selectedPart?.number || '',
    isBomOpen
  );

  const handleSearch = () => {
    setSearchTrigger(keyword);
  };

  const handleOpenBom = (partNumber: string, description: string) => {
    setSelectedPart({ number: partNumber, desc: description });
    setIsBomOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, md: 4 }, position: 'relative' }}>
      {/* 頂部進度條 */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
          <LinearProgress color="primary" />
        </Box>
      )}

      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" color="textPrimary" sx={{ mb: 1 }}>料號資訊查詢</Typography>
            <Typography variant="body1" color="textSecondary">
              Agile PLM 料號與 BOM 結構查詢 
              {isLoading && (
                <Typography component="span" variant="body2" color="primary" sx={{ ml: 2, fontWeight: 700 }}>
                  (正在連線 PLM SDK，請耐心等候...)
                </Typography>
              )}
            </Typography>
            <Divider sx={{ mt: 3 }} />
          </Box>

          <Card elevation={0} sx={{ border: '1px solid #e0e4e8', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="搜尋料號或描述"
                  placeholder="輸入關鍵字..."
                  variant="outlined"
                  size="small"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
                />
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={isLoading || !keyword}
                  sx={{ minWidth: 120 }}
                >
                  {isLoading ? "搜尋中..." : "搜尋"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ position: 'relative' }}>
            {/* 局部遮罩 */}
            <Fade in={isLoading}>
              <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                backdropFilter: 'blur(2px)'
              }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>正在從 PLM 獲取資料</Typography>
                <Typography variant="body2" color="textSecondary">連線 SDK 並建立 Session 中，這可能需要一分鐘...</Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <HourglassEmptyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                   <Typography variant="caption" color="textSecondary">正在處理：{searchTrigger}</Typography>
                </Box>
              </Box>
            </Fade>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e4e8', borderRadius: 3, minHeight: 400 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>料號</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>描述</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>版本</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>生命週期</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!searchTrigger && !isLoading ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}>請輸入關鍵字並點擊搜尋按鈕</TableCell></TableRow>
                  ) : parts && parts.length > 0 ? (
                    parts.map((part) => (
                      <TableRow key={part.partNumber} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link 
                            component="button" 
                            onClick={() => handleOpenBom(part.partNumber, part.description)}
                            sx={{ textDecoration: 'none', fontWeight: 700 }}
                          >
                            {part.partNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{part.description}</TableCell>
                        <TableCell>{part.revision}</TableCell>
                        <TableCell>{part.lifecyclePhase}</TableCell>
                      </TableRow>
                    ))
                  ) : !isLoading && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}>查無相符的料號資料</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      </Container>

      {/* BOM 結構彈窗 */}
      <Dialog 
        open={isBomOpen} 
        onClose={() => setIsBomOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>BOM 結構清單</Typography>
            <Typography variant="caption" color="textSecondary">{selectedPart?.number} - {selectedPart?.desc}</Typography>
          </Box>
          <IconButton onClick={() => setIsBomOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>序號</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>料號</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>描述</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>數量</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>版本</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isBomLoading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : !bomData || bomData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>此料號無下階 BOM 資訊</TableCell></TableRow>
                ) : (
                  bomData.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{item.sequence}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.partNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.revision}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsBomOpen(false)} variant="outlined">關閉</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartManagementPage;
