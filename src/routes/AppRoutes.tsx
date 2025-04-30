import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyerCalendarPage from '../pages/Dashboard/BuyerCalendarPage';
import ProtectedRoute from "../utils/ProtectedRoute";
import BecomingABuyer from '../components/BecomingABuyer/BecomingABuyer';

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
const CorporateSolutions = React.lazy(() => import('../components/CorporateSolutions/CorporateSolutions'));
const SaaSandERP = React.lazy(() => import('../components/SasSAndERP/SaaSAndERP'));
const CommercialEquipment = React.lazy(() => import('../components/CommericalEquipment/CommericalEquipment'));
const FandBSuppliers = React.lazy(() => import('../components/FandBSupplier/FandBSupplier'));
const ServiceProductsPage = React.lazy(() => import('../pages/Dashboard/ServiceProductPage'));
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
                <Route path="/search" element={<ServiceProductsPage />} />

                {/* Becoming a Vendor*/}
                <Route path="/become-a-vendor" element={<BecomingAVendor />} />
                {/* Vendor Pricing & Verification*/}
                <Route path="/vendor-prices" element={<VendorPricingVerification />} />
                {/* Becoming a Buyer*/}
                <Route path="/become-a-buyer" element={<BecomingABuyer />} />

                {/* Corporate Solutions*/}
                <Route path='/corporate-solutions' element={<CorporateSolutions />} />
                {/* SaaS and ERP*/}
                <Route path='/saas-erp' element={<SaaSandERP />} />
                {/* Commercial Equipment*/}
                <Route path='/commerical-equipment' element={<CommercialEquipment />} />
                 {/* F and B Suppliers*/}
                <Route path='/f-b-suppliers' element={<FandBSuppliers />} />
                
            </Routes>
        </Suspense>
    )
};


export default AppRoutes;
