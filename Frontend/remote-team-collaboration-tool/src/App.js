import React from 'react';
import FileTree from './Components/FileTree';
import FileUpload from './Components/FileUpload';
import { Box } from '@chakra-ui/react';

function App() {
  return (
    <Box
      backgroundImage="url('/background-transformed.jpeg')" // Adjusted path to the public folder
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      height="100vh" // Full viewport height
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding="20px"
      backgroundColor="rgba(0, 0, 0, 0.5)" // Fallback color in case the image isn't visible
    >
      <FileTree owner="MandadiVaishnavi" repo="My_Shopping_App" branch="main" />
      <FileUpload owner="MandadiVaishnavi" repo="My_Shopping_App" branch="main" />
    </Box>
  );
}

export default App;
