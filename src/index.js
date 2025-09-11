// src/index.js - Remove BrowserRouter from here
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import AppWrapper from './components/AppWrapper'; // ✅ Keep using AppWrapper
import { Provider } from 'react-redux';
import store from './store/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* ✅ No BrowserRouter here since AppWrapper has it */}
      <AppWrapper />
    </Provider>
  </React.StrictMode>
);
