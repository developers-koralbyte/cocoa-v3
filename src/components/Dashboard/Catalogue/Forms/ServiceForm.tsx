import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import upload from '../../../../utils/upload';

export interface ServiceFormData {
  name: string;
  description: string;
  image: string;
  price?: number;
  softwareUsed?: string;
  pricingType?: string;
}

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: ServiceFormData) => void;
  editService?: any | null; // The service to edit, if any
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editService 
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    image: '',
    price: 0,
    softwareUsed: '',
    pricingType: 'one-time',
  });
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Set form data if we're editing a service
  useEffect(() => {
    if (editService) {
      setFormData({
        name: editService.name || '',
        description: editService.description || '',
        image: editService.photo || editService.image || '',
        price: editService.price || 0,
        softwareUsed: editService.softwareUsed || '',
        pricingType: editService.pricingType || 'one-time',
      });
    } else {
      // Reset form if not editing
      setFormData({
        name: '',
        description: '',
        image: '',
        price: 0,
        softwareUsed: '',
        pricingType: 'one-time',
      });
    }
  }, [editService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload the file and get URL
      const imageUrl = await upload(file);
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      setFormData(prev => ({
        ...prev,
        image: imageUrl as string
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Add a specific software to the list
  const addSoftware = (software: string) => {
    const currentSoftware = formData.softwareUsed || '';
    
    // Check if the software is already added (case insensitive)
    if (!currentSoftware.split(',').some(s => 
      s.trim().toLowerCase() === software.toLowerCase()
    )) {
      // Add the new software
      const updatedSoftware = currentSoftware 
        ? `${currentSoftware},${software}` 
        : software;
        
      setFormData(prev => ({
        ...prev,
        softwareUsed: updatedSoftware
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-purple-100 rounded-2xl w-full max-w-md overflow-hidden shadow-lg">
        <div className="flex justify-between items-center bg-purple-400 p-4 text-white">
          <h2 className="text-xl font-bold">
            {editService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-white" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700">
              Pricing Type
            </label>
            <select
              id="pricingType"
              name="pricingType"
              value={formData.pricingType}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="one-time">One-time payment</option>
              <option value="hourly">Hourly rate</option>
              <option value="monthly">Monthly subscription</option>
              <option value="yearly">Yearly subscription</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-32"
              required
            />
          </div>
          
          <div>
            <label htmlFor="softwareUsed" className="block text-sm font-medium text-gray-700">
              Software Experience
            </label>
            
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {/* Show selected software as tags */}
                {formData.softwareUsed?.split(',')
                  .filter(software => software.trim() !== '')
                  .map((software, idx) => (
                    <div 
                      key={idx}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      <span>{software.trim()}</span>
                      <button
                        type="button"
                        className="ml-1 text-purple-600 hover:text-purple-800"
                        onClick={() => {
                          const updatedSoftware = formData.softwareUsed
                            ?.split(',')
                            .filter(s => s.trim() !== software.trim())
                            .join(',');
                          setFormData(prev => ({
                            ...prev,
                            softwareUsed: updatedSoftware
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              
              {/* Software input with suggestions */}
              <div className="relative">
                <input
                  type="text"
                  id="softwareInput"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Type software name and press Enter (e.g. QuickBooks, Excel)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                      e.preventDefault();
                      const newSoftware = e.currentTarget.value.trim();
                      addSoftware(newSoftware);
                      
                      // Clear the input
                      e.currentTarget.value = '';
                    }
                  }}
                />
                
                {/* Quick selection buttons for common software */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                    onClick={() => addSoftware("QuickBooks")}
                  >
                    + QuickBooks
                  </button>
                  
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                    onClick={() => addSoftware("Xero")}
                  >
                    + Xero
                  </button>
                  
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                    onClick={() => addSoftware("Microsoft Excel")}
                  >
                    + Microsoft Excel
                  </button>
                  
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                    onClick={() => addSoftware("Adobe Photoshop")}
                  >
                    + Adobe Photoshop
                  </button>
                  
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                    onClick={() => addSoftware("Adobe Premiere Pro")}
                  >
                    + Adobe Premiere Pro
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Add software you have experience with, separating each with Enter
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
            
            {formData.image ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img 
                    src={formData.image} 
                    alt="Service" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Change image
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-purple-500 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                </label>
                
                {isUploading && (
                  <div className="w-full mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-white text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-purple-50"
              disabled={isUploading}
            >
              {editService ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;