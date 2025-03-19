import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import BaseLayout from '../../../components/Dashboard/BaseLayout';
import { useUserStore } from '../../../utils/userStore';
import { ArrowLeft, Share2, Edit, MessageCircle, Trash2 } from 'lucide-react';
import ServiceForm, { ServiceFormData } from '../../../components/Dashboard/Catalogue/Forms/ServiceForm';

interface ServiceDetail {
  id?: string;
  name: string;
  description: string;
  price: number;
  pricingType?: string; // 'hourly', 'monthly', 'one-time'
  reviews: number;
  softwareUsed: string;
  photo: string;
  vendorId: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  userName: string;
  userPhoto: string;
  date: any; // Timestamp or date
  serviceId: string;
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserStore() as { currentUser: any };
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Fetch service data and reviews
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get service details
        const serviceDoc = await getDoc(doc(db, 'services', serviceId));
        
        if (serviceDoc.exists()) {
          setService({ id: serviceDoc.id, ...serviceDoc.data() } as ServiceDetail);
          
          // Get reviews for this service
          const reviewsQuery = query(
            collection(db, 'reviews'), 
            where('serviceId', '==', serviceId)
          );
          
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsList: Review[] = [];
          
          reviewsSnapshot.forEach((doc) => {
            reviewsList.push({ id: doc.id, ...doc.data() } as Review);
          });
          
          setReviews(reviewsList);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId]);

  // Check if current user is the owner of this service
  const isOwner = currentUser?.id === service?.vendorId;
  
  // Check if user is a buyer
  const isBuyer = currentUser?.role === 'buyer';
  
  // Check if the buyer has already left a review
  const hasReviewed = isBuyer && reviews.some(review => review.userId === currentUser?.id);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  // Count ratings for distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // For 1-5 stars
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  // Format price display based on pricing type
  const getPriceDisplay = () => {
    if (!service || service.price <= 0) return 'Contact for pricing';
    
    const formattedPrice = `${service.price.toFixed(2)}CAD`;
    
    switch(service.pricingType) {
      case 'hourly':
        return `${formattedPrice}/Hour`;
      case 'monthly':
        return `${formattedPrice}/Month`;
      case 'yearly':
        return `${formattedPrice}/Year`;
      default:
        return formattedPrice; // One-time payment or default
    }
  };

  // Handle leave review click
  const handleLeaveReview = () => {
    console.log('Leave review for service:', serviceId);
  };

  // Handle share click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.name,
        text: `Check out this service: ${service?.name}`,
        url: window.location.href,
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy link:', err));
    }
  };

  // Handle contact provider click
  const handleContactProvider = () => {
    console.log('Contact provider for service:', serviceId);
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  // Handle service update
  const handleServiceUpdate = async (data: ServiceFormData) => {
    if (!serviceId || !service) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const serviceRef = doc(db, 'services', serviceId);
      
      // Prepare the data to update
      const updatedData: Partial<ServiceDetail> = {
        name: data.name,
        description: data.description,
        price: data.price || 0,
        softwareUsed: data.softwareUsed || '',
        pricingType: data.pricingType || 'one-time'
      };
      
      // Only update the photo if a new one was uploaded
      if (data.image && data.image !== service.photo) {
        updatedData.photo = data.image;
      }
      
      // Update in Firestore
      await updateDoc(serviceRef, updatedData);
      
      // Update local state
      setService(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedData,
          photo: data.image || prev.photo
        };
      });
      
      setIsEditFormOpen(false);
      alert('Service updated successfully');
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Failed to update service');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  // Handle service deletion
  const handleDeleteConfirm = async () => {
    if (!serviceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      alert('Service deleted successfully');
      navigate('/catalogue'); // Redirect back to catalogue
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
      setIsLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  function timeAgo(date: Date) {
    const now = new Date();
    const secondsPast = (now.getTime() - date.getTime()) / 1000;

    if (secondsPast < 60) {
      return `${Math.floor(secondsPast)} seconds ago`;
    }
    if (secondsPast < 3600) {
      return `${Math.floor(secondsPast / 60)} minutes ago`;
    }
    if (secondsPast < 86400) {
      return `${Math.floor(secondsPast / 3600)} hours ago`;
    }
    if (secondsPast < 2592000) {
      return `${Math.floor(secondsPast / 86400)} days ago`;
    }
    if (secondsPast < 31536000) {
      return `${Math.floor(secondsPast / 2592000)} months ago`;
    }
    return `${Math.floor(secondsPast / 31536000)} years ago`;
  }

  return (
    <BaseLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!isLoading && !error && service && (
          <div>
            {/* Header Section - Circular image with title */}
            <div className="flex items-start mb-10">
              <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-2 border-gray-200 mr-6 flex-shrink-0 bg-gray-100">
                <img
                  src={service.photo || '/path-to-default-service-image.jpg'}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/path-to-default-service-image.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold ml-5 mt-10">{service.name}</h1>
                
                {/* Vendor Actions */}
                {isOwner && (
                  <div className="flex mt-4 ml-5 space-x-3">
                    <button 
                      onClick={handleEditClick}
                      className="flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Service
                    </button>
                    <button 
                      onClick={handleDeleteClick}
                      className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Service
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Service Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Service description</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700">{service.description}</p>
              </div>
            </div>
            
            {/* Price and Software Experience - Side by side on desktop */}
            <div className="flex flex-col md:flex-row md:gap-8 mb-12">
              {/* Price Section */}
              <div className="mb-6 md:mb-0 md:w-1/3">
                <h2 className="text-2xl font-bold mb-4">Price</h2>
                <div className="inline-block bg-gray-100 rounded-full px-6 py-2 text-lg">
                  {getPriceDisplay()}
                </div>
              </div>
              
              {/* Software Experience Section */}
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-4">Software experience</h2>
                
                {service.softwareUsed ? (
                  <div className="flex flex-wrap gap-3">
                    {service.softwareUsed.split(',').map((software, idx) => {
                      const softwareName = software.trim();
                      // Map common software to their appropriate colors and icons
                      const softwareMap: { [key: string]: { bg: string; shortName: string; fullName: string } } = {
                        'adobe premier pro': {
                          bg: 'bg-purple-800',
                          shortName: 'Pr',
                          fullName: 'Adobe Premiere Pro'
                        },
                        'premiere pro': {
                          bg: 'bg-purple-800',
                          shortName: 'Pr',
                          fullName: 'Adobe Premiere Pro'
                        },
                        'adobe photoshop': {
                          bg: 'bg-blue-700',
                          shortName: 'Ps',
                          fullName: 'Adobe Photoshop'
                        },
                        'photoshop': {
                          bg: 'bg-blue-700',
                          shortName: 'Ps',
                          fullName: 'Adobe Photoshop'
                        },
                        'adobe illustrator': {
                          bg: 'bg-orange-600',
                          shortName: 'Ai',
                          fullName: 'Adobe Illustrator'
                        },
                        'illustrator': {
                          bg: 'bg-orange-600',
                          shortName: 'Ai',
                          fullName: 'Adobe Illustrator'
                        },
                        'quickbooks': {
                          bg: 'bg-green-600',
                          shortName: 'QB',
                          fullName: 'QuickBooks'
                        },
                        'xero': {
                          bg: 'bg-blue-500',
                          shortName: 'XR',
                          fullName: 'Xero'
                        },
                        'microsoft excel': {
                          bg: 'bg-green-700',
                          shortName: 'Ex',
                          fullName: 'Microsoft Excel'
                        },
                        'excel': {
                          bg: 'bg-green-700',
                          shortName: 'Ex',
                          fullName: 'Microsoft Excel'
                        },
                        'notion': {
                          bg: 'bg-gray-800',
                          shortName: 'No',
                          fullName: 'Notion'
                        },
                        'sage': {
                          bg: 'bg-emerald-600',
                          shortName: 'SG',
                          fullName: 'Sage'
                        },
                        'freshbooks': {
                          bg: 'bg-green-500', 
                          shortName: 'FB',
                          fullName: 'FreshBooks'
                        },
                        'wave': {
                          bg: 'bg-cyan-600',
                          shortName: 'WV',
                          fullName: 'Wave'
                        },
                        'final cut pro': {
                          bg: 'bg-gray-700',
                          shortName: 'FC',
                          fullName: 'Final Cut Pro'
                        },
                        'davinci resolve': {
                          bg: 'bg-pink-700',
                          shortName: 'DR',
                          fullName: 'DaVinci Resolve'
                        }
                      };
                      
                      // Find the software in our map (case insensitive)
                      const softwareKey = Object.keys(softwareMap).find(
                        key => key.toLowerCase() === softwareName.toLowerCase()
                      );
                      
                      const software_info = softwareKey 
                        ? softwareMap[softwareKey] 
                        : {
                            bg: 'bg-gray-700',
                            shortName: softwareName.substring(0, 2),
                            fullName: softwareName
                          };
                      
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center"
                          title={software_info.fullName}
                        >
                          <div className={`w-10 h-10 ${software_info.bg} rounded-lg flex items-center justify-center text-white font-semibold mr-1`}>
                            {software_info.shortName}
                          </div>
                          <span className="text-sm">{software_info.fullName}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No software experience listed</p>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>
              
              {/* Main Review Stats */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Average Rating with big number */}
                <div className="flex items-center md:w-1/3">
                  <div className="text-6xl font-bold mr-4">
                    {averageRating.toFixed(1)}
                  </div>
                  <div>
                    {/* Star display */}
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          className={`text-2xl ${star <= Math.round(averageRating) ? 'text-purple-600' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Rating Distribution Bars */}
                <div className="md:w-2/3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center mb-2">
                      <span className="w-4 text-gray-600">{rating}</span>
                      <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden mx-2">
                        <div 
                          className="bg-purple-600 h-full" 
                          style={{ 
                            width: `${reviews.length ? (ratingCounts[rating-1] / reviews.length * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t my-8"></div>
              
              {/* Individual Reviews */}
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 mb-6 last:border-0">
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-lg mr-2">{review.userName}</h3>
                        <span className="text-sm text-purple-600">{review.date?.toDate ? 
                          `a ${timeAgo(review.date.toDate())}` : 
                          ''}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">{service.name}</div>
                      
                      <div className="flex mb-3 text-purple-600">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star}
                            className={star <= review.rating ? '' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-gray-700">{review.comment}</p>
                      
                      <div className="flex mt-4 gap-4">
                        <button className="text-purple-600">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                          </span>
                        </button>
                        <button className="text-purple-600">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No reviews yet</p>
                )}
              </div>
              
              {/* Leave Review Button - for buyers only */}
              {isBuyer && !hasReviewed && (
                <div className="mt-8">
                  <button 
                    onClick={handleLeaveReview}
                    className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Edit Service Form */}
        {service && (
          <ServiceForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            onSubmit={handleServiceUpdate}
            editService={{
              ...service,
              image: service.photo // Map photo to image for the form
            }}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Delete Service</h2>
              <p className="mb-6">Are you sure you want to delete "{service?.name}"? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ServiceDetailPage;