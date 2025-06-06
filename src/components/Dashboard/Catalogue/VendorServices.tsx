import React, { useState, useEffect } from 'react'
import { Plus, Edit, X, AlertTriangle } from 'lucide-react'
import ServiceForm, { ServiceFormData } from './Forms/ServiceForm'
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'

// Define the service interface with the required fields
interface Service {
  id?: string
  name: string
  description: string
  price: number
  reviews: number
  softwareUsed: string
  photo: string
  vendorId: string
  pricingType?: string
}

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const VendorServices: React.FC = () => {
  // Store & Router
  const { currentUser } = useUserStore() as { currentUser: { id: string } }
  const navigate = useNavigate()

  // State
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isServiceFormOpen, setIsServiceFormOpen] = useState<boolean>(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  // Fetch services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentUser?.id) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)

      try {
        const servicesRef = collection(db, 'services')
        const q = query(servicesRef, where('vendorId', '==', currentUser.id))
        const querySnapshot = await getDocs(q)

        const servicesData: Service[] = []
        querySnapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() } as Service)
        })

        setServices(servicesData)
      } catch (error) {
        console.error('Error fetching services:', error)
        setError('Failed to load services. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [currentUser?.id])

  // Check for duplicate services
  const checkForDuplicateService = (data: ServiceFormData, excludeId?: string): boolean => {
    return services.some(service => 
      service.id !== excludeId && 
      service.name.toLowerCase().trim() === data.name.toLowerCase().trim()
    )
  }

  // Show alert modal
  const showAlert = (title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message
    })
  }

  // Close alert modal
  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: '',
      message: ''
    })
  }

  // Handlers
  const handleAddService = () => {
    setEditingService(null)
    setIsServiceFormOpen(true)
  }

  const handleEditService = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation() // prevent the row click from navigating
    setEditingService(service)
    setIsServiceFormOpen(true)
  }

  const handleServiceFormSubmit = async (data: ServiceFormData) => {
    if (!currentUser?.id) {
      console.error('No user ID available')
      return
    }

    // Check for duplicates and show alert modal
    const isDuplicate = checkForDuplicateService(data, editingService?.id)
    if (isDuplicate) {
      showAlert(
        'Duplicate Service Name',
        `A service with the name "${data.name}" already exists. Please choose a different name.`
      )
      return
    }

    setIsLoading(true)
    setError(null) // Clear any previous errors
    
    try {
      if (editingService?.id) {
        // Update existing service
        const serviceRef = doc(db, 'services', editingService.id)
        const updatedData: Partial<Service> = {
          name: data.name,
          description: data.description,
          price: data.price || 0,
          softwareUsed: data.softwareUsed || '',
          pricingType: data.pricingType || 'one-time',
        }
        // Only update photo if a new one was uploaded
        if (data.image && data.image !== editingService.photo) {
          updatedData.photo = data.image
        }
        await updateDoc(serviceRef, updatedData)

        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? { ...s, ...updatedData, photo: data.image || s.photo }
              : s
          )
        )
        setEditingService(null)
      } else {
        // Create a new service
        const newService: Omit<Service, 'id'> = {
          name: data.name,
          description: data.description,
          price: data.price || 0,
          reviews: 0,
          softwareUsed: data.softwareUsed || '',
          photo: data.image,
          vendorId: currentUser.id,
          pricingType: data.pricingType || 'one-time',
        }

        const docRef = await addDoc(collection(db, 'services'), newService)
        setServices((prev) => [...prev, { id: docRef.id, ...newService }])
      }
      setIsServiceFormOpen(false)
    } catch (error) {
      console.error('Error adding/editing service:', error)
      showAlert(
        'Error',
        'Failed to add/edit service. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-12">
      {/* Card container */}
      <div className="bg-gray-100 rounded-[1.5rem] shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">My Services</h2>

        {/* Error message (for general errors, not duplicate service errors) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            {error}
            <button
              className="absolute top-1 right-2 font-bold"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* If no services */}
        {!isLoading && !error && services.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
            <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
              <Plus size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-500 mb-2">No services added yet.</p>
          </div>
        )}

        {/* List of services with scrollable container */}
        {!isLoading && !error && services.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-4">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center relative cursor-pointer"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  {/* Circle image on the left */}
                  <div className="w-14 h-14 mr-3 rounded-full border-2 border-purple-200 flex items-center justify-center bg-gray-100 overflow-hidden">
                     {service.photo ? (
                       <img
                         src={service.photo}
                         alt={service.name}
                         className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-purple-400 w-6 h-6" />
                          )}
                    </div>

                  {/* Mobile view: Only title */}
                  <div className="md:hidden">
                    <h3 className="text-base font-semibold">{service.name}</h3>
                  </div>

                  {/* Desktop view: Title and description */}
                  <div className="hidden md:block w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit button on the right (mobile only) */}
                  <button
                    className="absolute right-0 bg-buttonBg text-white rounded-full p-1 shadow-md hover:bg-purple-700 transition-colors block md:hidden"
                    onClick={(e) => handleEditService(service, e)}
                    aria-label="Edit service"
                  >
                    <Edit size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add Service Button at the bottom */}
        {!isLoading && !error && (
          <div className="flex justify-center mt-6">
            <button
              className="flex items-center gap-2 bg-buttonBg text-white py-2 px-4 rounded-full transition-colors"
              onClick={handleAddService}
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={isServiceFormOpen}
        onClose={() => {
          setIsServiceFormOpen(false)
          setEditingService(null)
          setError(null) // Clear error when closing
        }}
        onSubmit={handleServiceFormSubmit}
        editService={editingService}
      />

      {/* Alert Modal for duplicate service and other alerts */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={closeAlert}
      />
    </div>
  )
}

export default VendorServices