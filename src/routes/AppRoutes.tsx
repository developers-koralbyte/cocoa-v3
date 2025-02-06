import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NewBuyer from '../pages/NewBuyer'
import NewVendor from '../pages/NewVendor'
import ForgotPasswordPage from '../pages/Forgot_Password/ForgotPasswordPage'
import NewPasswordPage from '../pages/Forgot_Password/NewPasswordPage'
import VerificationPage from '../pages/Forgot_Password/VerificationPage'
import SignupSelectionPage from '../pages/SignUpSelectionPage'
import Dashboard from '../pages/Dashboard/Dashboard'
import InvoicePage from '../pages/Dashboard/InvoicesPage'
import CalendarPage from '../pages/Dashboard/CalendarPage';
import InboxPage from '../pages/Dashboard/InboxPage';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<SignupSelectionPage />} />
            <Route path="/new-buyer" element={<NewBuyer />} />
            <Route path="/new-vendor" element={<NewVendor />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/new-password" element={<NewPasswordPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/invoices" element={<InvoicePage />} />
            <Route path="dashboard/calendar" element={<CalendarPage />} />
            <Route path="dashboard/inbox" element={<InboxPage />} />
        </Routes>
    )
}

export default AppRoutes
