import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NoteEditorPage from './pages/NoteEditorPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';



function App() {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <main className="p-4 bg-gray-100 min-h-[calc(100vh-64px)]">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/notes/:id" element={<PrivateRoute><NoteEditorPage /></PrivateRoute>} />
                        <Route path="/create-note" element={<PrivateRoute><NoteEditorPage /></PrivateRoute>} />

                        <Route path="/admin/users" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}


export default App;