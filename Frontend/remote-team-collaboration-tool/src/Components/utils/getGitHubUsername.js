import axios from 'axios';

const getGitHubUsername = async () => {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`, // Ensure your token is in the .env file
      },
    });

    return response.data.login; // Return the username (login)
  } catch (error) {
    console.error('Error fetching GitHub user information:', error);
    return null;
  }
};

export default getGitHubUsername;
