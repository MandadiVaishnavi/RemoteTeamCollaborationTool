const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL of the raw file
const url = 'https://raw.githubusercontent.com/MandadiVaishnavi/My_Shopping_App/main/Shopping_App/Backend/models/Products.js';

// Path where you want to save the file
const filePath = path.resolve(__dirname, 'filename.extension');

axios({
    method: 'get',
    url: url,
    responseType: 'stream'
}).then(response => {
    response.data.pipe(fs.createWriteStream(filePath));
    console.log('File downloaded successfully!');
}).catch(error => {
    console.error('Failed to download file:', error.message);
});
