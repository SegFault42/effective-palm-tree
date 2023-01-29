// import React from 'react';
import Header from './components/Header/Header';
import Transaction from './components/Transaction/Transaction';
import TxHistory from './components/TxHistory/TxHistory';

import * as React from 'react';
import Box from '@mui/material/Box';


export default function App() {
  return (
    <div>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Transaction />
        <TxHistory />
      </Box>
    </div>
  );
}
