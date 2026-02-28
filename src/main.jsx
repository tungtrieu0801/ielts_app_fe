import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ChakraProvider, defaultSystem} from '@chakra-ui/react'
// 1. Import Provider của Google
import { GoogleOAuthProvider } from '@react-oauth/google'
import {VITE_GOOGLE_CLIENT_ID} from "./config/env.js";


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 3. Bọc GoogleOAuthProvider ngoài cùng, truyền clientId vào */}
        <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
            <ChakraProvider value={defaultSystem}>
                <App />
            </ChakraProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)



//Google OAuth components must be used within GoogleOAuthProvider, màng bọc GoogleOAuthProvider chứa Client ID (mã định
// danh của bạn trên Google, từ đó hook useGoogleLogin moi biết cách gọi lên Google Server
