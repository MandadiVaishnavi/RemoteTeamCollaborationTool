// import React, { useEffect, useState } from 'react';
// import FileTree from './FileTree';
// import { Box } from '@chakra-ui/react';
// import getGitHubUsername from './utils/getGitHubUsername';

// const FileExplorer = () => {
//   const [username, setUsername] = useState('');
//   const [repoInfo, setRepoInfo] = useState({ owner: '', repo: '' });
//   const [selectedBranch, setSelectedBranch] = useState('main'); // Default branch or set as needed

//   useEffect(() => {
//     const fetchUsername = async () => {
//       const user = await getGitHubUsername();
//       setUsername(user);
//     };

//     const fetchRepoInfo = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/repo/info'); // Adjust the URL as needed
//         const data = await response.json();
//         setRepoInfo(data);
//       } catch (error) {
//         console.error('Error fetching repo info:', error);
//       }
//     };

//     fetchUsername();
//     fetchRepoInfo();
//   }, []);

//   return (
//     <Box p={4}>
//       {/* Render the FileTree component with the fetched GitHub username and repo info */}
//       {username && (
//         <FileTree owner={repoInfo.owner} repo={repoInfo.repo} branch={selectedBranch} />
//       )}
//     </Box>
//   );
// };

// export default FileExplorer;




import React, { useState, useEffect } from 'react';
import FileTree from './FileTree';
import { Box } from '@chakra-ui/react';
import getGitHubUsername from './utils/getGitHubUsername';
import axios from 'axios';

const FileExplorer = ({ selectedBranch }) => { // Accept selectedBranch as a prop
  const [username, setUsername] = useState('');
  const [repoInfo, setRepoInfo] = useState({ owner: '', repo: '' });

  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = await getGitHubUsername();
        const { data } = await axios.get('http://localhost:5000/api/repo/info');
        setUsername(user);
        setRepoInfo(data);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
  }, []);

  return (
    <Box p={4}>
      {username && (
        <FileTree owner={repoInfo.owner} repo={repoInfo.repo} branch={selectedBranch} />
      )}
    </Box>
  );
};

export default FileExplorer;
