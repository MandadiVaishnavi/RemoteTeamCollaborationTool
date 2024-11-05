import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Select, Box, Text } from '@chakra-ui/react';
import './FileTree.css';

const Dashboard = ({ onBranchChange }) => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    // Fetch branches for the fixed repository from the backend
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/repo/branches'); // Update with your backend URL
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const handleBranchChange = (event) => {
    const branch = event.target.value;
    onBranchChange(branch);
  };

  return (
    <Box>
      <Text fontSize="2xl">Select a Branch</Text>
      <Select placeholder="Select branch" onChange={handleBranchChange}>
        {branches.map((branch) => (
          <option key={branch.name} value={branch.name}>
            {branch.name}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default Dashboard;
