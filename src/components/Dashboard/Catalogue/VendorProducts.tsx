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
  // Store & Router
  const { currentUser } = useUserStore() as { currentUser: { id: string } }
  const navigate = useNavigate()

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Fetch products from Firestore
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
        const q = query(productsRef, where('vendorId', '==', currentUser.id))
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
  }, [currentUser?.id])

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsProductFormOpen(true)
  }

  const handleEditProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation() // avoid navigating
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
        const updatedData: Partial<Product> = {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock || 0,
          category: data.category || '',
          pricingType: data.pricingType || 'one-time',
        }
        // Only update photo if a new one was uploaded
        if (data.image && data.image !== editingProduct.photo) {
          updatedData.photo = data.image
        }
        await updateDoc(productRef, updatedData)

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...updatedData, photo: data.image || p.photo }
              : p
          )
        )
        setEditingProduct(null)
      } else {
        // Create a new product
        const newProduct: Omit<Product, 'id'> = {
          name: data.name,
          description: data.description,
          price: data.price,
          reviews: 0,
          stock: data.stock || 0,
          category: data.category || '',
          photo: data.image,
          vendorId: currentUser.id,
          pricingType: data.pricingType || 'one-time',
        }

        const docRef = await addDoc(collection(db, 'products'), newProduct)
        setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }])
      }
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
      {/* Card container */}
      <div className="bg-white rounded-[1.5rem] shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">My Products</h2>

        {/* Error message */}
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

        {/* If no products */}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
            <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
              <Plus size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-500 mb-2">No products added yet.</p>
          </div>
        )}

        {/* List of products with scrollable container */}
        {!isLoading && !error && products.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center relative cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Circle image on the left */}
                  <div className="w-14 h-14 mr-3 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                    <img
                      src={product.photo || '/path-to-default-product-image.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/path-to-default-product-image.jpg'
                      }}
                    />
                  </div>

                  {/* Mobile view: Only title */}
                  <div className="md:hidden flex-grow">
                    <h3 className="text-base font-semibold">{product.name}</h3>
                  </div>

                  {/* Desktop view: Title and description */}
                  <div className="hidden md:block w-full">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-base font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit button on the right (mobile only) */}
                  <button
                    className="absolute right-0 bg-buttonBg text-white rounded-full p-1 shadow-md hover:bg-purple-700 transition-colors block md:hidden"
                    onClick={(e) => handleEditProduct(product, e)}
                    aria-label="Edit product"
                  >
                    <Edit size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add Product Button at the bottom */}
        {!isLoading && !error && (
          <div className="flex justify-center mt-6">
            <button
              className="flex items-center gap-2 bg-buttonBg text-white py-2 px-4 rounded-full transition-colors"
              onClick={handleAddProduct}
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleProductFormSubmit}
        editProduct={editingProduct}
      />
    </div>
  )
}

export default VendorProducts
