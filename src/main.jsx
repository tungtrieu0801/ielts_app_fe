import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { VITE_GOOGLE_CLIENT_ID } from "./constants/env.js";
import { Provider } from "./components/ui/provider.jsx";
import ColorModeSyncer from './shared/components/ColorModeSyncer.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
            <Provider>
                {/* Sync color mode preference từ auth store khi app load */}
                <ColorModeSyncer />
                <App />
            </Provider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
