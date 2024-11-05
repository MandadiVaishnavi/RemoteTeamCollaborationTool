import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, VStack } from '@chakra-ui/react';

const FolderSelector = ({ owner, repo, branch, onSelect }) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [currentPath, setCurrentPath] = useState(''); // Track current path for fetching subdirectories

    useEffect(() => {
        fetchFolders(currentPath); // Fetch folders on mount and when currentPath changes
    }, [owner, repo, branch, currentPath]);

    const fetchFolders = async (path) => {
        if (!owner || !repo || !branch) {
            console.error('Missing parameters:', { owner, repo, branch });
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/folders', {
                params: { owner, repo, branch, path }, // Pass the current path
            });
            setFolders(response.data);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const handleFolderSelect = (folder) => {
        if (selectedFolder === folder.path) {
            // If the folder is already selected, you might want to clear the selection
            setSelectedFolder('');
            onSelect(null);
        } else {
            setSelectedFolder(folder.path); // Store the path
            onSelect(folder); // Pass the selected folder back to the parent
            setCurrentPath(folder.path); // Update current path to fetch subdirectories
        }
    };

    return (
        <VStack spacing={2} align="stretch">
            {folders.map((folder) => (
                <Button
                    key={folder.path}
                    onClick={() => handleFolderSelect(folder)}
                    variant={selectedFolder === folder.path ? 'solid' : 'outline'}
                    colorScheme="blue"
                    width="full"
                >
                    {folder.name}
                </Button>
            ))}
        </VStack>
    );
};

export default FolderSelector;
