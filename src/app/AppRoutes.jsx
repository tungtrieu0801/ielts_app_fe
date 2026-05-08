import { Routes, Route } from "react-router-dom";
import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import { OAuthSuccess } from "../features/auth/pages/OAuthSuccess.jsx";
import HomePage from "../features/home/pages/HomePage";
import SetsPage from "../features/vocabulary/pages/SetsPage.jsx";
import VocabularyPage from "../features/vocabulary/pages/VocabularyPage";
import StudyPage from "../features/study/pages/StudyPage.jsx";
import DictationPage from "../features/dictation/pages/DictationPage.jsx";
import GameLobbyPage from "../features/game/pages/GameLobbyPage.jsx";
import GamePlayPage from "../features/game/pages/GamePlayPage.jsx";
import SettingsPage from "../features/settings/pages/SettingsPage.jsx";
import PremiumPage from "../features/premium/pages/PremiumPage.jsx";
import RankingPage from "../features/ranking/pages/RankingPage.jsx";
import PrivateRoute from "../shared/components/PrivateRoute.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Protected */}
            <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/sets" element={<PrivateRoute><SetsPage /></PrivateRoute>} />
            <Route path="/sets/:setId" element={<PrivateRoute><VocabularyPage /></PrivateRoute>} />
            <Route path="/study/:setId" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
            <Route path="/dictation" element={<PrivateRoute><DictationPage /></PrivateRoute>} />
            <Route path="/game" element={<PrivateRoute><GameLobbyPage /></PrivateRoute>} />
            <Route path="/game/:roomId" element={<PrivateRoute><GamePlayPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/premium" element={<PrivateRoute><PremiumPage /></PrivateRoute>} />
            <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
        </Routes>
    );
}