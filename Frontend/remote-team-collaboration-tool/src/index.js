import React from 'react';
import ReactDOM from 'react-dom/client'; // Change import to use 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import App from './App';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Router> {/* Wrap App in Router */}
        <App />
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);
