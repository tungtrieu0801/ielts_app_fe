import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import { OAuthSuccess } from "../features/auth/pages/OAuthSuccess.jsx";
import HomePage from "../features/home/pages/HomePage";
import SetsPage from "../features/vocabulary/pages/SetsPage.jsx";
import VocabularyPage from "../features/vocabulary/pages/VocabularyPage";
import StudyPage from "../features/study/pages/StudyPage.jsx";
import DictationPage from "../features/dictation/pages/DictationPage.jsx";
import PrivateRoute from "../shared/components/PrivateRoute.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Protected */}
            <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/sets" element={<PrivateRoute><SetsPage /></PrivateRoute>} />
            <Route path="/sets/:setId" element={<PrivateRoute><VocabularyPage /></PrivateRoute>} />
            <Route path="/study/:setId" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
            <Route path="/dictation" element={<PrivateRoute><DictationPage /></PrivateRoute>} />
        </Routes>
    );
}