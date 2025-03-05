import React, { useState } from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/Dashboard/BaseLayout';
import ServiceForm, { ServiceFormData } from '../../pages/Dashboard/InvoicePage/Forms/ServiceForm';
import ProductForm, { ProductFormData } from '../../pages/Dashboard/InvoicePage/Forms/ProductForm';

interface Appointment {
    name: string;
    company: string;
    time: string;
    date: string;
    image: string;
}

interface Buyer {
    name: string;
    company: string;
    match: number;
    image: string;
}

interface Service {
    title: string;
    image: string;
}

interface Product {
    title: string;
    image: string;
    price?: string;
}

const appointments: Appointment[] = [
    {
        name: 'Gustavo',
        company: 'Creative Hive',
        time: '9:00am - 9:30am',
        date: 'Wed 22',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Diana',
        company: 'TechNest',
        time: '1:00pm - 1:30pm',
        date: 'Fri 24',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Amrit',
        company: 'Startup Hub',
        time: '10:00am - 10:30am',
        date: 'Mon 27',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    },
];

const buyers: Buyer[] = [
    {
        name: 'Diana',
        company: 'TechNest',
        match: 93,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Kevin',
        company: 'FlexSpace Studios',
        match: 87,
        image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Margaret',
        company: 'OfficeOne Hub',
        match: 82,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Yihao',
        company: 'Collaborative HQ',
        match: 78,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
    },
];

const initialServices: Service[] = [
    {
        title: 'Accounting Software',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'CFO Services',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Audit Services',
        image: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Accounting and Bookkeeping Services',
        image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
    },
];

const initialPopularServices: Service[] = [
    {
        title: 'Audit Services',
        image: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Accounting and Bookkeeping Services',
        image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
    },
];

const initialProducts: Product[] = [];

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>(initialServices);
    const [popularServices, setPopularServices] = useState<Service[]>(initialPopularServices);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);

    const handleAddService = (serviceData: ServiceFormData) => {
        const newService = {
            title: serviceData.name,
            image: serviceData.image || 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
        };
        setServices([...services, newService]);
    };

    const handleAddProduct = (productData: ProductFormData) => {
        const newProduct = {
            title: productData.name,
            image: productData.image || 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
            price: productData.price,
        };
        setProducts([...products, newProduct]);
    };

    return (
        <>
            <BaseLayout>
                <div className="flex min-h-screen bg-transparent">
                    <div className="flex-1 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-bold font-nunito">
                                Welcome Peter,
                            </h1>
                            <div className="flex gap-4">
                                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <RotateCcw className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <section className="mb-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-nunito">
                                    My Catalogue
                                </h2>
                                <button 
                                    onClick={() => setIsServiceFormOpen(true)}
                                    className="flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full hover:bg-purple-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Service</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                                {services.map((service, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {service.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-nunito">
                                    My Products
                                </h2>
                                <button 
                                    onClick={() => setIsProductFormOpen(true)}
                                    className="flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full hover:bg-purple-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Product</span>
                                </button>
                            </div>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-4 gap-6">
                                    {products.map((product, index) => (
                                        <div key={index} className="text-center">
                                            <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-sm font-medium">
                                                {product.title}
                                            </h3>
                                            {product.price && (
                                                <p className="text-sm text-purple-600">${product.price}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div 
                                            className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer"
                                            onClick={() => setIsProductFormOpen(true)}
                                        >
                                            <Plus className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <p className="text-gray-500">No products yet. Click to add your first product.</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 font-nunito">
                                My Popular Services
                            </h2>
                            <div className="grid grid-cols-4 gap-6">
                                {popularServices.map((service, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {service.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 font-nunito text-purple-400">
                                Your Potential Buyers
                            </h2>
                            <p className="text-gray-600 mb-6 font-nunito">
                                These buyer's interests match your services, you
                                can reach them with a one-time message.
                            </p>
                            <div className="grid grid-cols-4 gap-6">
                                {buyers.slice(0, 4).map((buyer, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={buyer.image}
                                                alt={buyer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {buyer.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {buyer.company}
                                        </p>
                                        <p className="text-sm text-purple-600 mt-1">
                                            {buyer.match}% match
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right panel */}
                    <div className="w-96 bg-purple-100 p-8 rounded-l-[3.5rem]">
                        {/* Profile Section */}
                        <div className="flex items-center justify-center gap-x-5 gap-4 mb-8">
                            <div>
                                <h2 className="font-bold font-nunito">
                                    Peter, Accountix
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-nunito">
                                        Vendor
                                    </span>
                                    <span className="text-xs bg-purple-200 px-2 py-1 rounded-full font-nunito">
                                        Premium Account
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150"
                                    alt="Peter"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <section className="bg-white rounded-[2rem] p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold font-nunito">
                                    Upcoming Appointments
                                </h3>
                                <div className="flex gap-2">
                                    <button className="text-purple-600">
                                        &lt;
                                    </button>
                                    <button className="text-purple-600">
                                        &gt;
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {appointments.map((apt, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img
                                                src={apt.image}
                                                alt={apt.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-medium">
                                                    {apt.name},{' '}
                                                    <span className="text-purple-600">
                                                        {apt.company}
                                                    </span>
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {apt.date}, {apt.time}
                                            </div>
                                        </div>
                                        <div
                                            className="cursor-pointer"
                                            onClick={() =>
                                                alert(
                                                    `Reminder set for ${apt.name}`
                                                )
                                            }
                                        >
                                            <Bell className="w-4 h-4 text-purple-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Your Buyers Section */}
                        <section className="bg-white rounded-[2rem] p-6">
                            <h3 className="font-bold mb-4">Your buyers</h3>
                            <div className="space-y-4">
                                {buyers.map((buyer, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img
                                                src={buyer.image}
                                                alt={buyer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">
                                                {buyer.name}
                                            </h4>
                                            <p className="text-md text-purple-600 font-bold">
                                                {buyer.company}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </BaseLayout>

            {/* Service Form Modal */}
            <ServiceForm 
                isOpen={isServiceFormOpen}
                onClose={() => setIsServiceFormOpen(false)}
                onSubmit={handleAddService}
            />

            {/* Product Form Modal */}
            <ProductForm 
                isOpen={isProductFormOpen}
                onClose={() => setIsProductFormOpen(false)}
                onSubmit={handleAddProduct}
            />
        </>
    );
};

export default VendorDashboard;