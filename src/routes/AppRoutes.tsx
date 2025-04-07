import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyerCalendarPage from '../pages/Dashboard/BuyerCalendarPage';
import ProtectedRoute from "../utils/ProtectedRoute";

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
const BuyerInvoicePage = React.lazy(() => import('../pages/Dashboard/InvoicePage/BuyerInvoicePage'));
const VendorInvoicePage = React.lazy(() => import('../pages/Dashboard/InvoicePage/VendorInvoicePage'));
const CreateNewInvoice = React.lazy(() => import('../pages/Dashboard/InvoicePage/CreateNewInvoice'));
const CalendarPage = React.lazy(() => import('../pages/Dashboard/CalendarPage'));
const InboxPage = React.lazy(() => import('../pages/Dashboard/InboxPage'));
const AccountingSoftware = React.lazy(() => import('../pages/Dashboard/AccountingSoftware'));
const BecomingAVendor = React.lazy(() => import('../components/BecomeAVendor/BecomingAVendor'));
const VendorPricingVerification = React.lazy(() => import('../components/VendorPricing&Verification/VendorPricing&Verification'));
const CataloguePage = React.lazy(() => import('../pages/Dashboard/Catalogue/CataloguePage'));
const ServiceDetailPage = React.lazy(() => import('../pages/Dashboard/Catalogue/ServiceDetailPage'));
const ProductDetailPage = React.lazy(() => import('../pages/Dashboard/Catalogue/ProductDetailPage'));
const EditInvoicePage = React.lazy(() => import('../pages/Dashboard/InvoicePage/EditInvoicePage'));
const AppRoutes: React.FC = () => {
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/create-account"
                    element={<SignupSelectionPage />}
                />
                <Route path="/new-buyer" element={<NewBuyer />} />
                <Route path="/new-vendor" element={<NewVendor />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
                <Route path="/new-password" element={<NewPasswordPage />} />
                <Route path="/verification" element={<VerificationPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />

                {/* Protected Routes for Vendors */}
                <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                    <Route
                        path="/vendor-dashboard"
                        element={<VendorDashboard />}
                    />
                    <Route path="/invoices" element={<VendorInvoicePage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path='/catalogue' element={<CataloguePage/>} />
                    <Route
                        path="/accounting-software"
                        element={<AccountingSoftware />}
                    />
                    <Route
                        path="/create-new-invoice"
                        element={<CreateNewInvoice />}
                    />
                    <Route path="/edit-invoice/:invoiceId" element={<EditInvoicePage />} />
                </Route>
                <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
                {/* Protected Routes for Buyers */}
                <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
                    <Route
                        path="/buyer-dashboard"
                        element={<BuyerDashboard />}
                    />
                    <Route
                        path="/buyer-calendar"
                        element={<BuyerCalendarPage />}
                    />
                    <Route path="/buyer-invoices" element={<BuyerInvoicePage />} />
                    <Route path="/buyer-inbox" element={<InboxPage />} />
                </Route>

                {/* Becoming a Vendor*/}
                <Route path="/become-a-vendor" element={<BecomingAVendor />} />
                {/* Vendor Pricing & Verification*/}
                <Route path="/vendor-pricing&verification" element={<VendorPricingVerification />} />
            </Routes>
        </Suspense>
    )
};


export default AppRoutes;
