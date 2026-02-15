import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
    <ToastContainer position="top-right" autoClose={4000} />
  </BrowserRouter>
);
