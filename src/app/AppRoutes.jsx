import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import HomePage from "../features/home/pages/HomePage";
import VocabularyPage from "../features/vocabulary/pages/VocabularyPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
                path="/home"
                element={<HomePage />}
            />
            <Route path="/vocabulary" element={<VocabularyPage />} />
        </Routes>
    );
}