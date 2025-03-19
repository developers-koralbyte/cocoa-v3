import React from 'react';
import BaseLayout from '../../../components/Dashboard/BaseLayout';
import Header from '../../../components/Dashboard/Invoices/HeaderProps';
import VendorServices from '../../../components/Dashboard/Catalogue/VendorServices';
import VendorProducts from '../../../components/Dashboard/Catalogue/VendorProducts';

const CataloguePage: React.FC = () => {
    return (
        <BaseLayout>
            <div className="p-4 md:p-6 lg:p-8">
                {/* Header Section - Responsive adjustments */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold font-nunito">
                        Catalogue
                    </h1>
                    <div className="self-end sm:self-auto">
                        <Header />
                    </div>
                </div>

                {/* Responsive wrapper with proper spacing */}
                <div className="space-y-8 md:space-y-12">
                    {/* Vendor Services */}
                    <VendorServices />
                    
                    {/* Vendor Products */}
                    <VendorProducts />
                </div>
            </div>
        </BaseLayout>
    );
};

export default CataloguePage;