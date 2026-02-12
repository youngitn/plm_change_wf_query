import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, AppBar, Toolbar, Typography } from '@mui/material';
import ChangeManagementPage from './features/change-management';
import PartManagementPage from './features/part-management';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e4e8' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" sx={{ mr: 4, fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
              PLM QUERY
            </Typography>
            <Tabs 
              value={currentTab} 
              onChange={(_, newValue) => setCurrentTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="變更查詢" />
              <Tab icon={<SettingsInputComponentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="料號查詢" />
            </Tabs>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <ChangeManagementPage />}
        {currentTab === 1 && <PartManagementPage />}
      </Box>
    </Box>
  );
}

export default App;
