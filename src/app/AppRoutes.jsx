import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import HomePage from "../features/home/pages/HomePage";
import VocabularyPage from "../features/vocabulary/pages/VocabularyPage";
import {OAuthSuccess} from "../features/auth/pages/OAuthSuccess.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
                path="/home"
                element={<HomePage />}
            />
            <Route path="/vocabulary" element={<VocabularyPage />} />

            <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>
    );
}