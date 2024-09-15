import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const RealTimeEditor = () => {
  const [document, setDocument] = useState('');

  useEffect(() => {
    socket.on('document-update', (data) => {
      console.log('Document update received:', data);
      setDocument(data);
    });

    return () => {
      socket.off('document-update');
    };
  }, []);

  const handleChange = (event) => {
    const newDocument = event.target.value;
    setDocument(newDocument);
    socket.emit('document-change', newDocument);
  };

  return (
    <textarea
      value={document}
      onChange={handleChange}
      placeholder="Type something..."
    />
  );
};

export default RealTimeEditor;
