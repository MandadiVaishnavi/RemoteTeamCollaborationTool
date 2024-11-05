import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@chakra-ui/react';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import FileExplorer from './Components/FileExplorer';
import ActivityFeed from './Components/ActivityFeed';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [repoInfo, setRepoInfo] = useState({ owner: '', repo: '' });
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/repo/info');
        setRepoInfo(response.data);
      } catch (error) {
        console.error('Error fetching repository info:', error);
      }
    };

    fetchRepoInfo();
  }, []);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
  };

  return (
    <Router>
      <Grid templateColumns="1fr" gap={4}>
        <Box as="nav" position="fixed" top={0} width="100%" zIndex={1}>
          <Navbar />
        </Box>
        <Box mt={16} p={4} className="text-content">
          <Switch>
            <Route path="/dashboard">
              <Dashboard onBranchChange={handleBranchChange} />
            </Route>
            <Route path="/file-explorer">
              <FileExplorer selectedRepo={repoInfo.repo} selectedBranch={selectedBranch} />
            </Route>
            <Route path="/activity-feed">
              <ActivityFeed repo={repoInfo.repo} branch={selectedBranch} />
            </Route>
            {/* Add more routes as needed */}
          </Switch>
        </Box>
      </Grid>
    </Router>
  );
};

export default App;
