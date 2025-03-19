import React, { useState, useEffect } from 'react'
import { Plus, Edit } from 'lucide-react'
import ProductForm, { ProductFormData } from './Forms/ProductForm'
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import { useNavigate } from 'react-router-dom'

// Define the interface for a product
interface Product {
    id?: string
    name: string
    description: string
    price: number
    reviews: number
    stock: number
    category: string
    photo: string
    vendorId: string
    pricingType?: string
}

const VendorProducts: React.FC = () => {
    // Get current user from the store
    const { currentUser } = useUserStore() as { currentUser: { id: string } }
    const navigate = useNavigate()
    // Manage products
    const [products, setProducts] = useState<Product[]>([])
    // Manage loading state
    const [isLoading, setIsLoading] = useState<boolean>(true)
    // Manage error state
    const [error, setError] = useState<string | null>(null)
    // Manage modal visibility
    const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false)
    // Track if we're editing an existing product or creating a new one
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    // Fetch products from Firebase on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            if (!currentUser?.id) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const productsRef = collection(db, 'products')
                const q = query(
                    productsRef,
                    where('vendorId', '==', currentUser.id)
                )
                const querySnapshot = await getDocs(q)

                const productsData: Product[] = []
                querySnapshot.forEach((doc) => {
                    productsData.push({ id: doc.id, ...doc.data() } as Product)
                })

                setProducts(productsData)
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Failed to load products. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [currentUser?.id]) // Only re-run when currentUser?.id changes

    const handleAddProduct = () => {
        setEditingProduct(null) // Make sure we're not in edit mode
        setIsProductFormOpen(true)
    }

    const handleEditProduct = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent navigation to product detail page
        setEditingProduct(product)
        setIsProductFormOpen(true)
    }

    const handleProductFormSubmit = async (data: ProductFormData) => {
        if (!currentUser?.id) {
            console.error('No user ID available')
            return
        }

        setIsLoading(true)

        try {
            if (editingProduct?.id) {
                // Update existing product
                const productRef = doc(db, 'products', editingProduct.id)
                
                // Prepare the data to update
                const updatedData: Partial<Product> = {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock || 0,
                    category: data.category || '',
                    pricingType: data.pricingType || 'one-time'
                }
                
                // Only update the photo if a new one was uploaded
                if (data.image && data.image !== editingProduct.photo) {
                    updatedData['photo'] = data.image
                }
                
                // Update in Firestore
                await updateDoc(productRef, updatedData)
                
                // Update in local state
                setProducts(prev => prev.map(product => 
                    product.id === editingProduct.id 
                        ? { 
                            ...product, 
                            ...updatedData, 
                            // Keep the existing photo if no new one was uploaded
                            photo: data.image || product.photo
                          } 
                        : product
                ))
                
                setEditingProduct(null)
            } else {
                // Create a new product object
                const newProduct: Omit<Product, 'id'> = {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    reviews: 0,
                    stock: data.stock || 0,
                    category: data.category || '',
                    photo: data.image,
                    vendorId: currentUser.id,
                    pricingType: data.pricingType || 'one-time'
                }

                // Add to Firestore
                const docRef = await addDoc(collection(db, 'products'), newProduct)

                // Add to local state with the new ID
                setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }])
            }

            // Close the form
            setIsProductFormOpen(false)
        } catch (error) {
            console.error('Error managing product:', error)
            setError('Failed to save product. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mb-12">
            {/* Header Section with Title and "Add" Button */}
            <div className="flex flex-wrap items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mr-4">
                    My Products
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

            {/* Display placeholder if no products are added */}
            {!isLoading && !error && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
                    <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                        <Plus size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-500 mb-2">No products added yet.</p>
                    <button
                        className="flex items-center gap-2 bg-buttonBg text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                        onClick={handleAddProduct}
                    >
                        <Plus size={16} />
                        Add Your First Product
                    </button>
                </div>
            ) : (
                // Display products in a responsive grid layout
                !isLoading &&
                !error && (
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col items-center relative"
                            >
                                <div 
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 relative rounded-full overflow-hidden border-2 border-purple-200 cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <img
                                        src={
                                            product.photo ||
                                            '/path-to-default-product-image.jpg'
                                        }
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/path-to-default-product-image.jpg';
                                        }}
                                    />
                                    {/* Edit button overlay */}
                                    <button 
                                        className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1 m-1 shadow-md hover:bg-purple-700 transition-colors"
                                        onClick={(e) => handleEditProduct(product, e)}
                                        aria-label="Edit product"
                                    >
                                        <Edit size={14} />
                                    </button>
                                </div>
                                <h3 
                                    className="font-bold text-sm sm:text-base md:text-lg mb-0 sm:mb-1 text-center line-clamp-1 px-1 cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    {product.name}
                                </h3>
                                <p 
                                    className="text-xs sm:text-sm text-gray-600 text-center line-clamp-2 px-1 cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    {product.description}
                                </p>
                            </div>
                        ))}

                        {/* Add Product Button as a Card */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={handleAddProduct}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 rounded-full bg-purple-100 flex items-center justify-center border-2 border-dashed border-purple-300 hover:bg-purple-200 transition-colors"
                            >
                                <Plus size={24} className="text-purple-600" />
                            </button>
                            <p className="text-purple-600 font-medium text-center text-xs sm:text-sm">
                                Add product
                            </p>
                        </div>
                    </div>
                )
            )}

            {/* Product Form Modal */}
            <ProductForm
                isOpen={isProductFormOpen}
                onClose={() => {
                    setIsProductFormOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleProductFormSubmit}
                editProduct={editingProduct}
            />
        </div>
    )
}

export default VendorProducts