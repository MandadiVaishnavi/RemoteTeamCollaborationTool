const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // For environment variables

const app = express();
const port = 5000;

// Middleware to handle CORS and increase body payload limit
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for JSON requests
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase limit for URL-encoded requests

// Route to fetch the file tree
app.get('/api/tree', async (req, res) => {
  const { owner, repo, branch, path = '' } = req.query;
  console.log('Query Parameters:', { owner, repo, branch, path });

  if (!owner || !repo || !branch) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const token = process.env.GITHUB_TOKEN;

  const fetchTree = async (path = '') => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `token ${token}` },
      });

      const items = await Promise.all(
        response.data.map(async (item) => {
          if (item.name === 'node_modules') return null;

          if (item.type === 'dir') {
            const children = await fetchTree(item.path);
            return { name: item.name, path: item.path, type: item.type, children };
          } else {
            return { name: item.name, path: item.path, type: item.type, download_url: item.download_url };
          }
        })
      );

      return items.filter(Boolean);
    } catch (error) {
      console.error('Error fetching tree data:', error.message);
      return [];
    }
  };

  try {
    const treeData = await fetchTree(path);
    res.json(treeData);
  } catch (error) {
    console.error('Error fetching file tree:', error.message);
    res.status(500).json({ error: 'Error fetching file tree' });
  }
});

// New route to fetch file content
app.get('/api/file', async (req, res) => {
  const { owner, repo, branch, path } = req.query;

  if (!owner || !repo || !branch || !path) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `token ${token}` },
    });

    if (response.data && response.data.content) {
      const content = response.data.content;
      res.json({ content });
    } else {
      res.status(404).json({ error: 'File content not found' });
    }
  } catch (error) {
    console.error('Error fetching file content:', error.message);
    res.status(500).json({ error: 'Error fetching file content' });
  }
});

// New route to upload files
app.post('/api/upload', async (req, res) => {
  const { owner, repo, branch, filePath, content } = req.body;

  if (!owner || !repo || !branch || !filePath || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  try {
    // First, check if the file already exists in the repo
    let sha = null;
    try {
      const getFileResponse = await axios.get(url, {
        headers: { Authorization: `token ${token}` },
      });
      sha = getFileResponse.data.sha; // File exists, get the SHA to update it
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // File does not exist, so we will create a new one
        sha = null;
      } else {
        throw error;
      }
    }

    // Upload or update the file
    const response = await axios.put(
      url,
      {
        message: `Upload file ${filePath}`, // Commit message
        content: content, // Base64-encoded content
        branch: branch,
        sha: sha, // Include SHA if updating an existing file
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    res.json({ success: true, file: response.data.content });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.listen(port, () => console.log(`Backend server running on port ${port}`));
