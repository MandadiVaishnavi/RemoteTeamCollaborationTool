import React, { useState } from 'react';
import axios from 'axios';
import { Box, Heading, Input, Button, useToast } from '@chakra-ui/react';

const FileUpload = ({ owner, repo, branch }) => {
  const [file, setFile] = useState(null);
  const toast = useToast();

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload to the server
  const handleUpload = async () => {
    if (!file) return;

    const filePath = file.name;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = btoa(reader.result); // Encode the file content to base64

        // Make the API call to the backend to upload the file
        const response = await axios.post('http://localhost:5000/api/upload', {
          owner,
          repo,
          branch,
          filePath,
          content,
        });

        toast({
          title: 'File uploaded successfully.',
          description: `File: ${response.data.file.name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      };

      reader.readAsBinaryString(file); // Read the file content as a binary string
    } catch (error) {
      toast({
        title: 'Error uploading file.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxWidth="500px" mx="auto">
      <Heading mb={4}>Upload File</Heading>
      <Input type="file" onChange={handleFileChange} mb={4} />
      <Button colorScheme="blue" onClick={handleUpload}>
        Upload
      </Button>
    </Box>
  );
};

export default FileUpload;
