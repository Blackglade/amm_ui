import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Alert from '@mui/material/Alert';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CssBaseline from '@mui/material/CssBaseline';
import './index.css'

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: false,
    retry: false
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <Alert severity="error" style={{fontWeight: '600'}}>THIS APP IS FOR DEMO PURPOSES ONLY. DO NOT USE IN PRODUCTION.</Alert>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    <Alert id='footer' severity="error" style={{fontWeight: '600', marginTop: '4rem'}}>THIS APP IS FOR DEMO PURPOSES ONLY. DO NOT USE IN PRODUCTION.</Alert>
  </React.StrictMode>
)
