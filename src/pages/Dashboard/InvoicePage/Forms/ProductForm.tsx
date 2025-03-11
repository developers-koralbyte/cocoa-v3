import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface ProductFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (product: ProductFormData) => void
}

export interface ProductFormData {
    name: string
    description: string
    price: string
    image: string
}

const ProductForm: React.FC<ProductFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        image: '',
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        setFormData({ name: '', description: '', price: '', image: '' })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-purple-100 rounded-2xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center bg-purple-400 p-4 text-white">
                    <h2 className="text-xl font-bold">Add new Product</h2>
                    <button onClick={onClose} className="text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold mb-4">Product Details</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm mb-1"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm mb-1"
                                >
                                    Price
                                </label>
                                <input
                                    type="text"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="description"
                                className="block text-sm mb-1"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md h-32"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm mb-1">Images</label>
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center cursor-pointer">
                                    <Plus className="w-6 h-6 text-purple-600" />
                                </div>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="Image URL"
                                    className="flex-1 p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-white text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-purple-50"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductForm
