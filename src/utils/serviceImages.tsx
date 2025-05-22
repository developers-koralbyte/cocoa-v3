// src/utils/serviceImageMap.ts
// Manual imports - matching your actual image files
import accountingImg from '../assets/services/Accounting.jpg'
import advertisingImg from '../assets/services/Advertising.jpg'
import consultingImg from '../assets/services/Consulting.jpg'
import designImg from '../assets/services/Design.jpg'
import ecommerceImg from '../assets/services/Ecommerce.jpg'
import eventServicesImg from '../assets/services/Event Services.jpg'
import fnbImg from '../assets/services/FNB.jpg'
import hrImg from '../assets/services/HR.jpg'
import itImg from '../assets/services/IT.jpg'
import logisticsImg from '../assets/services/Logistics.jpg'
import manufacturingImg from '../assets/services/Manufacturing.jpg'
import marketingImg from '../assets/services/Marketing.jpg'
import otherImg from '../assets/services/Other.jpg'
import retailImg from '../assets/services/Retail.jpg'
import technologyImg from '../assets/services/Technology.jpg'
import wholesaleImg from '../assets/services/Wholesale.jpg'
import maintenanceImg from '../assets/services/Maintenance.jpg'

export const serviceImageMap: Record<string, string> = {
  // Direct matches between service values and image names
  'Accounting': accountingImg,
  'Consulting': consultingImg,
  'Ecommerce': ecommerceImg,
  'HR': hrImg,
  'IT': itImg,
  'Logistics': logisticsImg,
  'Manufacturing': manufacturingImg,
  'Marketing': marketingImg,
  'Other': otherImg,
  'Retail': retailImg,
  'Technology': technologyImg,
  'Wholesale': wholesaleImg,
  'Maintenance': maintenanceImg,
  
  // Handle mismatches between service values and image names
  'F&B': fnbImg,                    // service: 'F&B' -> image: 'FNB.jpg'
  'advertising': advertisingImg,     // service: 'advertising' -> image: 'Advertising.jpg'
  'Design': designImg,              // service: 'Design' -> image: 'Design.jpg'
  'Design Services': designImg,     // service label -> same image
  'event': eventServicesImg,        // service: 'event' -> image: 'Event Services.jpg'
  'Event Services': eventServicesImg, // service label -> same image
  
  // Services without matching images - will use fallbacks
  'printing': `https://via.placeholder.com/300x300?text=Printing`,
  'Printing': `https://via.placeholder.com/300x300?text=Printing`,
  'Packaging': `https://via.placeholder.com/300x300?text=Packaging`,
  'Distribution': `https://via.placeholder.com/300x300?text=Distribution`,
  'Supply Chain': `https://via.placeholder.com/300x300?text=Supply+Chain`,
  'Legal': `https://via.placeholder.com/300x300?text=Legal`,
  'Insurance': `https://via.placeholder.com/300x300?text=Insurance`,
  'Security': `https://via.placeholder.com/300x300?text=Security`,
  // 'Maintenance': `https://via.placeholder.com/300x300?text=Maintenance`, // Removed duplicate
  'Transportation': `https://via.placeholder.com/300x300?text=Transportation`,
  'Construction': `https://via.placeholder.com/300x300?text=Construction`,
  'Real Estate': `https://via.placeholder.com/300x300?text=Real+Estate`,
  'Education': `https://via.placeholder.com/300x300?text=Education`,
  'Healthcare': `https://via.placeholder.com/300x300?text=Healthcare`,
}

// Debug function to help you see which services are missing images
export const getMissingImages = (services: string[]) => {
  const missing = services.filter(service => 
    !serviceImageMap[service] || serviceImageMap[service].includes('placeholder')
  )
  console.log('Services without custom images:', missing)
  return missing
}