import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

import App from './App';
import { store } from './store/store';
import { ThemeProvider } from './shared/context/ThemeContext';
import theme from './styles/theme';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider>
                <MuiThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </MuiThemeProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);
