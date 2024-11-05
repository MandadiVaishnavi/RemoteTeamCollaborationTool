const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // For environment variables
const https = require('https');

const app = express();
const port = 5000;

// Middleware to handle CORS and increase body payload limit
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for JSON requests
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase limit for URL-encoded requests
// Import multer at the top of your file
const multer = require('multer');

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for easier access
});

// Define the GitHub API URL and token
const GITHUB_API_URL = 'https://api.github.com'; // Ensure this is defined
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Fixed repository to use
const fixedRepo = 'MandadiVaishnavi/My_Shopping_App'; // Change this to your specific repo

// Middleware to set Authorization headers
const setAuthHeaders = (req, res, next) => {
  req.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  next();
};
// Function to get the username dynamically from the token
async function getGitHubUsername(token) {
  try {
      const response = await axios.get('https://api.github.com/user', {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data.login;
  } catch (error) {
      console.error('Error fetching username:', error.message);
      throw new Error('Failed to retrieve GitHub username');
  }
}

// Route to get GitHub username from the token
app.get('/api/user', async (req, res) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    res.json({ username: response.data.login });
  } catch (error) {
    console.error('Error fetching GitHub user:', error.message);
    res.status(500).json({ error: 'Error fetching GitHub user' });
  }
});

// New route to get owner and repo information
app.get('/api/repo/info', (req, res) => {
  const [owner, repo] = fixedRepo.split('/'); // Split the fixed repo string
  res.json({ owner, repo });
});

// Route to fetch branches for the fixed repository
app.get('/api/repo/branches', async (req, res) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${fixedRepo}/branches`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching branches:', error.message);
    res.status(500).json({ error: 'Error fetching branches' });
  }
});

// Route to fetch the file tree
app.get('/api/tree', async (req, res) => {
  const { owner, repo, branch, path = '' } = req.query;
  // console.log('Query Parameters:', { owner, repo, branch, path });

  if (!owner || !repo || !branch) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const fetchTree = async (path = '') => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL verification for local testing
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

  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL verification for local testing
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
// Route to fetch paths
app.get('/api/repo/paths', async (req, res) => {
  const { owner, repo, branch } = req.query;
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const paths = data.tree
      .filter((item) => item.type === 'tree')
      .map((item) => item.path);
    res.json(paths);
  } catch (error) {
    console.error('Error fetching paths:', error.message);
    res.status(500).json({ error: 'Failed to fetch paths' });
  }
});


// Recursively fetch subdirectories
function getSubdirectories(dirPath) {
  return fs.readdirSync(dirPath)
    .filter((item) => item !== 'node_modules') // Exclude node_modules
    .filter((item) => fs.statSync(path.join(dirPath, item)).isDirectory())
    .map((folder) => ({
      name: folder,
      path: path.join(dirPath, folder),
    }));
}

// New route to fetch folders from GitHub repository
app.get('/api/folders', async (req, res) => {
  const { owner, repo, branch, path = '' } = req.query;

  if (!owner || !repo || !branch) {
    return res.status(400).json({ error: 'Missing required query parameters: owner, repo, and branch are required.' });
  }

  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const folders = response.data
      .filter(item => item.type === 'dir' && item.name !== 'node_modules')
      .map(item => ({
        name: item.name,
        path: item.path,
      }));

    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error.message);
    res.status(500).json({ error: 'Error fetching folders from GitHub API' });
  }
});



// Route to upload a file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  // console.log('incoming data ',req.body); // Log incoming data
  // console.log('uploaded data' ,req.file); // Log the uploaded file

  const { path: directoryPath, commitMessage } = req.body; // Get directory path and commit message from the form data

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  if (!commitMessage) {
    return res.status(400).json({ error: 'Commit message is required.' }); // Check for commit message
  }

  const filePath = `${directoryPath}`; // Correctly construct the file path

  try {
    const result = await uploadFileToGitHub({
      repo: fixedRepo.split('/')[1], // Get repo name
      branch: 'main',
      path: filePath,
      token: GITHUB_TOKEN,
      fileBuffer: req.file.buffer,
      commitMessage, // Include commit message
    });
    res.json(result);
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'Failed to upload the file', details: error.message });
  }
});


const uploadFileToGitHub = async ({ repo, branch, path, token, fileBuffer, commitMessage }) => {
  const owner = await getGitHubUsername(token);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  console.log('url ',url);
  const response = await axios.put(url, {
    message: commitMessage,
    content: fileBuffer.toString('base64'),
    branch: branch,
  }, {
    headers: {
      Authorization: `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  return response.data;
};

// Function to fetch commits from a GitHub repository
async function fetchCommits(repo, branch) {
  const owner = await getGitHubUsername(GITHUB_TOKEN);
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  try {
      const response = await axios.get(url, {
          params: { sha: branch },
          headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching commits:', error.response?.data?.message || error.message);
      throw new Error('Failed to fetch commits');
  }
}

// Endpoint to get commit history for a specific repository and branch
app.get('/api/commits', async (req, res) => {
  const { repo, branch } = req.query;

  if (!repo || !branch) {
      return res.status(400).json({ error: 'Repo and branch are required.' });
  }

  try {
      console.log(`Fetching commits for repo: ${repo}, branch: ${branch}`);
      const commits = await fetchCommits(repo, branch);
      console.log('Commits fetched:', commits);
      res.json(commits);
  } catch (error) {
      console.error(`Error in /api/commits for repo: ${repo}, branch: ${branch}:`, error.message);
      res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Start the server
app.listen(port, () => console.log(`Backend server running on port ${port}`));
