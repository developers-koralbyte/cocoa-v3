import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyerCalendarPage from '../pages/Dashboard/BuyerCalendarPage';

// Lazy load all the components
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const NewBuyer = React.lazy(() => import('../pages/NewBuyer'));
const NewVendor = React.lazy(() => import('../pages/NewVendor'));
const ForgotPasswordPage = React.lazy(() => import('../pages/Forgot_Password/ForgotPasswordPage'));
const NewPasswordPage = React.lazy(() => import('../pages/Forgot_Password/NewPasswordPage'));
const VerificationPage = React.lazy(() => import('../pages/Forgot_Password/VerificationPage'));
const SignupSelectionPage = React.lazy(() => import('../pages/SignUpSelectionPage'));
const VendorDashboard = React.lazy(() => import('../pages/Dashboard/VendorDashboard'));
const BuyerDashboard = React.lazy(() => import('../pages/Dashboard/BuyerDashboard'));
const InvoicePage = React.lazy(() => import('../pages/Dashboard/InvoicesPage'));
const CalendarPage = React.lazy(() => import('../pages/Dashboard/CalendarPage'));
const InboxPage = React.lazy(() => import('../pages/Dashboard/InboxPage'));

const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-account" element={<SignupSelectionPage />} />
                <Route path="/new-buyer" element={<NewBuyer />} />
                <Route path="/new-vendor" element={<NewVendor />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/new-password" element={<NewPasswordPage />} />
                <Route path="/verification" element={<VerificationPage />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                <Route path="/invoices" element={<InvoicePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/buyer-calendar" element={<BuyerCalendarPage />} />
                <Route path="/inbox" element={<InboxPage />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;