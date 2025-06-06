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
  editService?: any | null;
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
    pricingType: 'one-time'
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (editService) {
      setFormData({
        name: editService.name || '',
        description: editService.description || '',
        image: editService.photo || editService.image || '',
        price: editService.price || 0,
        softwareUsed: editService.softwareUsed || '',
        pricingType: editService.pricingType || 'one-time'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        price: 0,
        softwareUsed: '',
        pricingType: 'one-time'
      });
    }
  }, [editService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const interval = setInterval(() => {
        setUploadProgress(p => {
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 10;
        });
      }, 300);

      const imageUrl = await upload(file);

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      setFormData(prev => ({ ...prev, image: imageUrl as string }));
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

  const addSoftware = (software: string) => {
    const currentSoftware = formData.softwareUsed || '';
    const exists = currentSoftware
      .split(',')
      .some(s => s.trim().toLowerCase() === software.toLowerCase());
    if (!exists) {
      const updated = currentSoftware
        ? `${currentSoftware},${software}`
        : software;
      setFormData(prev => ({ ...prev, softwareUsed: updated }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#D9D9D9] rounded-2xl w-full max-w-sm md:max-w-lg overflow-hidden shadow-lg">
        <div className="flex justify-between items-center bg-buttonBg p-4 text-white">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {editService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-white" aria-label="Close modal">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Grid: 1 col on mobile, 2 cols on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm h-24 md:h-32"
              required
            />
          </div>

          <div>
            <label htmlFor="softwareUsed" className="block text-sm font-medium text-gray-700">
              Software Experience
            </label>

            {/* Selected software tags */}
            <div className="mt-2 flex flex-wrap gap-2 mb-2">
              {formData.softwareUsed
                ?.split(',')
                .filter(s => s.trim() !== '')
                .map((software, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                  >
                    <span className="truncate max-w-[100px]">{software.trim()}</span>
                    <button
                      type="button"
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => {
                        const updated = formData.softwareUsed
                          ?.split(',')
                          .filter(s => s.trim() !== software.trim())
                          .join(',');
                        setFormData(prev => ({
                          ...prev,
                          softwareUsed: updated
                        }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>

            {/* Input and suggestion buttons */}
            <div>
              <input
                type="text"
                id="softwareInput"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Type software and press Enter"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    e.preventDefault();
                    addSoftware(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />

              <div className="mt-2 flex flex-wrap gap-2">
                {['QuickBooks', 'Xero', 'Microsoft Excel', 'Photoshop', 'Premiere Pro']
                  .map(item => (
                    <button
                      key={item}
                      type="button"
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200"
                      onClick={() => addSoftware(item)}
                    >
                      + {item}
                    </button>
                  ))}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Press Enter or click a suggestion to add.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>

            {formData.image ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden">
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
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center">
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
                  <Upload className="w-8 h-8 text-purple-500 mb-1" />
                  <span className="text-sm text-gray-600">Click to upload</span>
                </label>

                {isUploading && (
                  <div className="w-full mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
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
              className="bg-white text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-purple-50 text-sm"
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
