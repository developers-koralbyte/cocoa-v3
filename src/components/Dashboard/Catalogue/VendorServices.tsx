import React, { useState, useEffect } from 'react'
import AddServicesIcon from '../../../assets/icons/AddServices.svg'
import { Plus } from 'lucide-react'
import ServiceForm, { ServiceFormData } from './Forms/ServiceForm'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import { useNavigate } from 'react-router-dom'

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
}

const VendorServices: React.FC = () => {
    // Get current user from the store
    const { currentUser } = useUserStore() as { currentUser: { id: string } }
    const navigate = useNavigate()
    // Manage the list of services
    const [services, setServices] = useState<Service[]>([])
    // Manage loading state
    const [isLoading, setIsLoading] = useState<boolean>(true)
    // Manage error state
    const [error, setError] = useState<string | null>(null)
    // Manage modal visibility
    const [isServiceFormOpen, setIsServiceFormOpen] = useState<boolean>(false)

    // Fetch services from Firebase on component mount
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
                const q = query(
                    servicesRef,
                    where('vendorId', '==', currentUser.id)
                )
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
    }, [currentUser?.id]) // Only re-run when currentUser?.id changes

    const handleAddService = () => {
        setIsServiceFormOpen(true)
    }

    const handleServiceFormSubmit = async (data: ServiceFormData) => {
        if (!currentUser?.id) {
            console.error('No user ID available')
            return
        }

        setIsLoading(true)

        try {
            // Create a new service object
            const newService: Omit<Service, 'id'> = {
                name: data.name,
                description: data.description,
                price: data.price || 0,
                reviews: 0,
                softwareUsed: data.softwareUsed || '',
                photo: data.image,
                vendorId: currentUser.id,
            }

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'services'), newService)

            // Add to local state with the new ID
            setServices((prev) => [...prev, { id: docRef.id, ...newService }])

            // Close the form
            setIsServiceFormOpen(false)
        } catch (error) {
            console.error('Error adding service:', error)
            setError('Failed to add service. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mb-12">
            {/* Header and Add Service Button - Adjusted positioning */}
            <div className="flex flex-wrap items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mr-4">
                    My Services
                </h2>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button 
                        className="float-right font-bold"
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

            {/* Placeholder when no services exist */}
            {!isLoading && !error && services.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
                    <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                        <Plus size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-500 mb-2">No services added yet.</p>
                    <button
                        className="flex items-center gap-2 bg-buttonBg text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                        onClick={handleAddService}
                    >
                        <Plus size={16} />
                        Add Your First Service
                    </button>
                </div>
            ) : (
                // Display services in a responsive grid layout with minimal gaps
                !isLoading &&
                !error && (
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="flex flex-col items-center cursor-pointer"
                                onClick={() =>
                                    navigate(`/service/${service.id}`)
                                }
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 relative rounded-full overflow-hidden border-2 border-purple-200">
                                    <img
                                        src={
                                            service.photo ||
                                            '/path-to-default-service-image.jpg'
                                        }
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src =
                                                '/path-to-default-service-image.jpg' // Fallback image
                                        }}
                                    />
                                </div>
                                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-0 sm:mb-1 text-center line-clamp-1 px-1">
                                    {service.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 text-center line-clamp-2 px-1">
                                    {service.description}
                                </p>
                            </div>
                        ))}

                        {/* Add Service Button as a Card */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={handleAddService}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 rounded-full bg-purple-100 flex items-center justify-center border-2 border-dashed border-purple-300 hover:bg-purple-200 transition-colors"
                            >
                                <Plus size={24} className="text-purple-600" />
                            </button>
                            <p className="text-purple-600 font-medium text-center text-xs sm:text-sm">
                                Add service
                            </p>
                        </div>
                    </div>
                )
            )}

            {/* Service Form Modal */}
            <ServiceForm
                isOpen={isServiceFormOpen}
                onClose={() => setIsServiceFormOpen(false)}
                onSubmit={handleServiceFormSubmit}
            />
        </div>
    )
}

export default VendorServices
