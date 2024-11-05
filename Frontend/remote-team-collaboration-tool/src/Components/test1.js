const fetch = require('node-fetch');

async function fetchRepoCommits(owner, repo, branch) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const commits = await response.json();
        commits.forEach(commit => {
            console.log(`Commit Message: ${commit.commit.message}`);
            console.log(`Author: ${commit.commit.author.name}`);
            console.log(`Date: ${commit.commit.author.date}`);
            console.log(`URL: ${commit.html_url}`);
            console.log('-'.repeat(40));
        });
    } catch (error) {
        console.error(error.message);
    }
}

// Example usage
const owner = 'MandadiVaishnavi';
const repo = 'My_Shopping_App';
const branch = 'main'; // Specify the branch you want to check
fetchRepoCommits(owner, repo, branch);
