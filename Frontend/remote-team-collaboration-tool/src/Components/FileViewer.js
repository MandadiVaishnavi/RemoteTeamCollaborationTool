// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const FileViewer = ({ owner, repo, path, branch }) => {
//   const [fileContent, setFileContent] = useState('');
//   const [fileName, setFileName] = useState('');

//   useEffect(() => {
//     const fetchFileContent = async () => {
//       try {
//         const response = await axios.get(
//           `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
//         );
//         const decodedContent = atob(response.data.content);
//         setFileContent(decodedContent);
//         setFileName(path.split('/').pop());
//       } catch (error) {
//         console.error('Error fetching file content:', error);
//       }
//     };
//     fetchFileContent();
//   }, [owner, repo, path, branch]);

//   const downloadFile = () => {
//   if (fileContent) {
//     try {
//       // Create a Blob with the file content
//       const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });

//       // Generate a temporary URL for the Blob
//       const url = URL.createObjectURL(blob);

//       // Create an anchor element
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = fileName || 'file.txt'; // Set filename or default

//       // Append the anchor to the document
//       document.body.appendChild(link);

//       // Programmatically click the anchor to trigger the download
//       link.click();

//       // Remove the anchor element
//       document.body.removeChild(link);

//       // Revoke the object URL
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error in downloadFile:', error);
//     }
//   } else {
//     console.warn('No file content available for download');
//   }
// };


//   return (
//     <div>
//       <pre>
//         <code>{fileContent}</code>
//       </pre>
//       <button onClick={downloadFile}>
//         Download File
//       </button>
//     </div>
//   );
// };

// export default FileViewer;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileViewer = ({ owner, repo, path, branch }) => {
  const [fileContent, setFileContent] = useState('');
  const [directoryContents, setDirectoryContents] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const token = process.env.REACT_APP_GITHUB_TOKEN;

  useEffect(() => {
    const fetchContents = async () => {
      try {
        if (path) {
          const contents = await fetchDirectoryContents(owner, repo, path, branch, token);
          if (contents && contents.length) {
            if (contents[0].type === 'file') {
              const file = contents.find(item => item.path === path);
              if (file) {
                const fileContent = await fetchFileContent(file.download_url);
                setFileContent(fileContent);
              }
            } else {
              setDirectoryContents(contents);
            }
          }
        }
      } catch (error) {
        setError('Failed to fetch content.');
      }
    };

    fetchContents();
  }, [owner, repo, path, branch, token]);

  const fetchFileContent = async (url) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3.raw'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  };

  const handleFileClick = async (filePath) => {
    const file = directoryContents.find(item => item.path === filePath);
    if (file && file.type === 'file') {
      const fileContent = await fetchFileContent(file.download_url);
      setFileContent(fileContent);
      setSelectedFile(filePath);
    }
  };

  return (
    <div>
      {error && <div>{error}</div>}
      {directoryContents.length > 0 && (
        <ul>
          {directoryContents.map(item => (
            <li key={item.path}>
              {item.type === 'dir' ? (
                <span>{item.name}</span>
              ) : (
                <button onClick={() => handleFileClick(item.path)}>{item.name}</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {fileContent && (
        <div>
          <h2>File Content</h2>
          <pre>
            <code>{fileContent}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
