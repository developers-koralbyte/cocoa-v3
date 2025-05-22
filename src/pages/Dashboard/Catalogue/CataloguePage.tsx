import React from 'react'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import Header from '../../../components/Dashboard/Invoices/HeaderProps'
import VendorServices from '../../../components/Dashboard/Catalogue/VendorServices'
import VendorProducts from '../../../components/Dashboard/Catalogue/VendorProducts'

const CataloguePage: React.FC = () => {
  return (
    <BaseLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-2xl lg:text-[60px] font-bold font-nunito">
            Catalogue
          </h1>
        </div>

        {/* 
          Use Tailwind’s responsive classes:
          - bg-[#8B85C1F2] for mobile
          - md:bg-white for medium screens and above 
        */}
        <div className="bg-[#8B85C1F2] md:bg-white p-6 rounded-[1.5rem]">
          {/* Stack your two white cards (Services + Products) with vertical spacing */}
          <div className="space-y-8 md:space-y-12">
            <VendorServices />
            <VendorProducts />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default CataloguePage
