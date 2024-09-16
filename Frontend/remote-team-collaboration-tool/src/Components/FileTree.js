import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Collapse, Text, Button, VStack, Divider, Icon } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import './FileTree.css'; // Import the CSS file

const FileTree = ({ owner, repo, branch }) => {
  const [treeData, setTreeData] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [errorFetchingContent, setErrorFetchingContent] = useState(false);
  const [openDirs, setOpenDirs] = useState({});

  const fetchTree = async (path = '') => {
    try {
      const response = await axios.get('http://localhost:5000/api/tree', {
        params: { owner, repo, branch, path },
      });

      const items = await Promise.all(
        response.data.map(async (item) => {
          if (item.name === 'node_modules') return null; // Skip node_modules folder

          if (item.type === 'dir') {
            const children = await fetchTree(item.path); // Recursively fetch subdirectories
            return {
              name: item.name,
              path: item.path,
              type: item.type,
              children,
            };
          } else {
            return {
              name: item.name,
              path: item.path,
              type: item.type,
              download_url: item.download_url, // Add download URL for files
            };
          }
        })
      );

      return items.filter(Boolean); // Filter out null values
    } catch (error) {
      console.error('Error fetching file tree:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadTree = async () => {
      const tree = await fetchTree();
      setTreeData(tree);
    };

    loadTree();
  }, [owner, repo, branch]);

  const fetchFileContent = async (path) => {
    try {
      const response = await axios.get('http://localhost:5000/api/file', {
        params: { owner, repo, branch, path },
      });

      if (response.data && response.data.content) {
        const content = atob(response.data.content); // Decode base64 content
        setFileContent(content);
        setErrorFetchingContent(false); // No error
      } else {
        setFileContent('No content available.');
        setErrorFetchingContent(true); // Error flag
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error fetching file content.');
      setErrorFetchingContent(true); // Set error flag
    }
  };

  const handleFileClick = (path, downloadUrl) => {
    setSelectedFilePath(path);
    fetchFileContent(path);
    setFileUrl(downloadUrl); // Set download URL
  };

  const handleDownload = async () => {
    try {
      if (!fileUrl) {
        console.error('No file URL available for download.');
        return;
      }

      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'blob', // Important for handling binary data
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const fileName = selectedFilePath.split('/').pop();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'file.txt';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);

      console.log(`File downloaded: ${fileName}`);
    } catch (error) {
      console.error('Failed to download file:', error.message);
    }
  };

  const toggleDir = (path) => {
    setOpenDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes, parentPath = '') => {
    if (!nodes) return null;
    return (
      <VStack align="start" spacing={1} pl={4}>
        {nodes.map((node) => (
          <Box key={node.path} ml={node.type === 'dir' ? 0 : 4}>
            {node.type === 'dir' ? (
              <>
                <Text
                  fontWeight="bold"
                  onClick={() => toggleDir(node.path)}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={openDirs[node.path] ? ChevronDownIcon : ChevronRightIcon} boxSize={4} />
                  {node.name}
                </Text>
                <Collapse in={openDirs[node.path]}>
                  {node.children && renderTree(node.children, node.path)}
                </Collapse>
              </>
            ) : (
              <Text
                onClick={() => handleFileClick(node.path, node.download_url)}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                {node.name}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    );
  };

  return (
    <Box className="file-tree-container">
      <Box className="file-tree-sidebar">
        <Text fontSize="lg" fontWeight="bold">
          File Tree
        </Text>
        {renderTree(treeData)}
      </Box>
      <Box className={`file-content ${selectedFilePath ? 'loaded' : ''}`}>
        {selectedFilePath && (
          <>
            <Text fontSize="lg" fontWeight="bold">
              Content of {selectedFilePath}
            </Text>
            <Box mt={2} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
              <pre>{fileContent}</pre>
            </Box>
            <Divider my={4} />
            {errorFetchingContent && fileUrl && (
              <Button colorScheme="blue" as="a" href={fileUrl} target="_blank" rel="noopener noreferrer">
                View File
              </Button>
            )}
            <Button mt={2} colorScheme="teal" onClick={handleDownload}>
              Download File
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default FileTree;
