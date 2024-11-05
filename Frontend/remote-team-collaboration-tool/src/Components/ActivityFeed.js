import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, List, ListItem, Spinner } from '@chakra-ui/react';

const ActivityFeed = ({ repo, branch }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      if (!repo || !branch) {
        setError('Repository and branch must be selected.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/commits', {
          params: { repo, branch }, // Use the passed props
        });
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activity:', error);
        setError('Failed to fetch activity.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [repo, branch]);

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="md">
      {loading ? (
        <Box display="flex" alignItems="center">
          <Spinner mr={2} />
          <Text>Loading activities...</Text>
        </Box>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : activities.length === 0 ? (
        <Text>No activity found</Text>
      ) : (
        <List spacing={3}>
          {activities.map((commit) => (
            <ListItem key={commit.sha} borderWidth={1} borderRadius="md" p={2}>
              <Text fontWeight="bold">{commit.commit.message}</Text>
              <Text fontSize="sm" color="gray.500">
                {commit.commit.author.name} - {new Date(commit.commit.author.date).toLocaleString()}
              </Text>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ActivityFeed;
