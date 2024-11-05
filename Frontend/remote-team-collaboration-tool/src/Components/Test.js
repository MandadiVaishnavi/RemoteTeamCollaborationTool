// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// // URL of the raw file
// const url = 'https://raw.githubusercontent.com/MandadiVaishnavi/My_Shopping_App/main/Shopping_App/Backend/models/Products.js';

// // Path where you want to save the file
// const filePath = path.resolve(__dirname, 'filename.extension');

// axios({
//     method: 'get',
//     url: url,
//     responseType: 'stream'
// }).then(response => {
//     response.data.pipe(fs.createWriteStream(filePath));
//     console.log('File downloaded successfully!');
// }).catch(error => {
//     console.error('Failed to download file:', error.message);
// });




// const axios = require('axios');
// const fs = require('fs');

// // Function to get the username dynamically from the token
// async function getGitHubUsername(token) {
//     try {
//         const response = await axios.get('https://api.github.com/user', {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//         return response.data.login;
//     } catch (error) {
//         console.error('Error fetching username:', error.response?.data?.message || error.message);
//         throw new Error('Failed to retrieve GitHub username');
//     }
// }

// // Function to upload a file to a specified path in a repository
// async function uploadFileToGitHub({ repo, branch = 'main', path, token, filePath }) {
//     try {
//         const owner = await getGitHubUsername(token);
//         const content = fs.readFileSync(filePath, 'base64');

//         // GitHub API URL for checking if the file exists
//         const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        
//         let sha = null;
//         try {
//             // Check if the file already exists
//             const response = await axios.get(getUrl, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             sha = response.data.sha; // Get the SHA if the file exists
//         } catch (error) {
//             if (error.response?.status !== 404) {
//                 console.error('Error checking file existence:', error.response?.data?.message || error.message);
//                 throw new Error('Failed to check file existence');
//             }
//         }

//         // Prepare request data for the upload
//         const data = {
//             message: `Add file at ${path}`,
//             content: content,
//             branch: branch,
//         };

//         // Include SHA if the file exists
//         if (sha) {
//             data.sha = sha; // Update the existing file
//         }

//         // GitHub API URL for uploading files
//         const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

//         // Send request to upload the file
//         const response = await axios.put(url, data, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         console.log('File uploaded successfully:', response.data);
//     } catch (error) {
//         console.error('Upload failed:', error.response?.data?.message || error.message);
//     }
// }


// // Example usage
// uploadFileToGitHub({
//     repo: 'My_Shopping_App',               // Repository name
//     branch: 'main',                       // Branch name
//     path: 'Shopping_App/Backend/models/test1.js',    // Path in the repository where file should be uploaded
//     token: 'TOKEN',  // GitHub Personal Access Token
//     filePath: 'C:\\Users\\Vaishnavi\\4-1\\Team collaboration tool\\Frontend\\remote-team-collaboration-tool\\src\\Components\\test1.js'
//  // Path to the local file you want to upload
// });




const axios = require('axios');
const inquirer = require('inquirer');

// Function to get the username from the token
async function getGitHubUsername(token) {
    const response = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.login;
}

// Function to fetch the contents of a repository directory
async function fetchDirectoryContents({ owner, repo, path, token }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // This will return an array of file and directory objects
}

// Function to navigate through directories
async function navigateDirectory({ owner, repo, path, token }) {
    try {
        const contents = await fetchDirectoryContents({ owner, repo, path, token });

        // Filter to get only directories
        const directories = contents.filter(item => item.type === 'dir');
        const files = contents.filter(item => item.type === 'file');

        // Display the directories and files
        console.log(`Contents of ${path}:`);
        directories.forEach((dir, index) => console.log(`${index + 1}. [DIR] ${dir.name}`));
        files.forEach((file, index) => console.log(`${directories.length + index + 1}. [FILE] ${file.name}`));

        // Allow user to select a directory or file
        const choices = [
            ...directories.map((dir, index) => ({ name: dir.name, value: `${path}/${dir.name}` })),
            ...files.map((file, index) => ({ name: file.name, value: null })),
            { name: 'Exit', value: 'exit' }
        ];

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'selected',
                message: 'Select a directory to navigate or exit:',
                choices: choices,
            },
        ]);

        if (answers.selected === 'exit') {
            console.log('Exiting...');
            return;
        } else {
            // Recursively navigate into the selected directory
            await navigateDirectory({ owner, repo, path: answers.selected, token });
        }
    } catch (error) {
        console.error('Error fetching directory contents:', error.message);
    }
}

// Example usage
(async () => {
    const token = 'Token'; // Replace with your GitHub token
    const repo = 'My_Shopping_App'; // Your repository name
    const owner = await getGitHubUsername(token); // Fetch owner username

    await navigateDirectory({ owner, repo, path: '', token }); // Start from the root
})();
