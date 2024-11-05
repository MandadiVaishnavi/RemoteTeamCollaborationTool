import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import FolderSelector from './FolderSelector';
import axios from 'axios';

const FileUpload = ({ owner, repo, branch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFolder, setSelectedFolder] = useState('');
  const [file, setFile] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const toast = useToast();

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder.path);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !selectedFolder) {
      toast({
        title: 'Error',
        description: 'Please select a file and a destination folder.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const filePath = `${selectedFolder}/${file.name}`; // Construct the full file path

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('commitMessage', commitMessage);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'File uploaded successfully.',
        description: `File: ${response.data.filePath || file.name} uploaded to ${selectedFolder}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Upload error:', error); // Log the error
      toast({
        title: 'Error uploading file.',
        description: error.response?.data?.error || 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxWidth="500px" mx="auto">
      <Heading mb={4} fontSize="lg" color="teal.500">Upload File</Heading>

      <Button onClick={onOpen} mb={4}>Select Folder</Button>
      <p>Selected Folder: {selectedFolder || 'None'}</p>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FolderSelector owner={owner} repo={repo} branch={branch} onSelect={handleFolderSelect} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Input type="file" onChange={handleFileChange} mb={4} />

      <Input
        placeholder="Commit message"
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        mb={4}
      />

      <Button colorScheme="blue" onClick={handleUpload} isDisabled={!selectedFolder || !file}>
        Upload
      </Button>
    </Box>
  );
};

export default FileUpload;
