import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// પેજીસ ઇમ્પોર્ટ કરો
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NoteEditorPage from './pages/NoteEditorPage';
import AdminPanelPage from './pages/AdminPanelPage';

function App() {
    return (
        <Router>
            {/* AuthProvider સમગ્ર એપ્લિકેશનમાં ઓથેન્ટિકેશન સ્ટેટ ઉપલબ્ધ કરાવે છે */}
            <AuthProvider>
                <Header /> {/* નેવિગેશન બાર */}
                <main className="p-4"> {/* મુખ્ય કન્ટેન્ટ માટે પેડિંગ */}
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* સુરક્ષિત રૂટ્સ: ફક્ત લૉગિન થયેલા યુઝર્સ માટે */}
                        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/notes/:id" element={<PrivateRoute><NoteEditorPage /></PrivateRoute>} />

                        {/* એડમિન રૂટ: ફક્ત એડમિન યુઝર્સ માટે */}
                        <Route path="/admin/users" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />

                        {/* 404 નોટ ફાઉન્ડ પેજ (વૈકલ્પિક) */}
                        <Route path="*" element={<div className="text-center mt-8 text-xl font-bold">404 - Page Not Found</div>} />
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}

export default App;