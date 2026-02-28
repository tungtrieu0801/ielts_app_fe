import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {FcGoogle} from "react-icons/fc";
import Login from "./pages/Login.jsx";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;