import { BsCheckCircle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

const PricingCard = ({
    price,
    features,
    buttonText,
    isHighlighted = false,
    planType,
}: {
    price: string
    features: string[]
    buttonText: string
    isHighlighted?: boolean
    planType: string
}) => {
    const navigate = useNavigate()

    const handleSignUpClick = () => {
        navigate('/create-account')
    }

    return (
        <div
            className={`rounded-3xl p-8 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
                isHighlighted
                    ? 'bg-purple-200 shadow-lg hover:bg-purple-300'
                    : 'bg-white shadow-md hover:bg-gray-100'
            }`}
        >
            <div className="space-y-6">
                <div>
                    <span
                        className={`text-4xl font-bold font-nunito ${isHighlighted ? 'text-purple-900' : ''}`}
                    >
                        {price}
                    </span>
                    <div className="mt-2">
                        <span
                            className={`inline-block px-4 py-1 rounded-full text-sm font-medium font-nunito ${isHighlighted ? 'bg-white text-purple-800' : 'bg-purple-100 text-purple-700'}`}
                        >
                            {planType}
                        </span>
                    </div>
                </div>

                <div className="pt-4">
                    <p className="font-semibold mb-4 font-nunito text-gray-800">
                        Features
                    </p>
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <BsCheckCircle
                                    className={`flex-shrink-0 mt-1 ${isHighlighted ? 'text-purple-900' : 'text-purple-600'}`}
                                />
                                <span className="text-sm text-gray-600 font-nunito">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={handleSignUpClick}
                    className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 text-white mt-4 font-nunito ${isHighlighted ? 'bg-purple-800 hover:bg-purple-900' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    )
}

const Pricing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E6E6FA] to-[#6868AC96] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl text-center mb-16">
                <h1 className="text-5xl font-bold mb-4">
                    <span className="text-purple-900">
                        Invest in Your Business,
                    </span>{' '}
                    <br />
                    <span className="text-black">Without the Overhead</span>
                </h1>
                <p className="text-black font-medium">
                    Choose the right price for you!
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <PricingCard
                    price="Free"
                    planType="Basic Plan"
                    features={[
                        'Only for 1 month',
                        'Enjoy one month of COCOA with full access to current features including automation',
                        'Explore limited access to the Business Directory across Ontario. Connect with them and grow your revenue',
                    ]}
                    buttonText="Sign up now"
                />

                <PricingCard
                    price="$2990"
                    planType="Premium Plan"
                    features={[
                        'Full access to our Business Directory across Ontario',
                        'Expand your outreach as we continue to onboard more and more F&B businesses',
                        'Enjoy priority customer support',
                        'Upgrade Option: Get featured as a preferred vendor for an additional cost',
                    ]}
                    buttonText="Sign up now"
                    isHighlighted={true}
                />

                <PricingCard
                    price="Contact for pricing"
                    planType="Custom Plan"
                    features={[
                        'Get all the features of the Advance Subscription',
                        'API Integration with your existing systems',
                        'Custom customizations to fit your growing business needs',
                        'Explore limited access to the Business Directory across Ontario. Connect with them and grow your revenue',
                    ]}
                    buttonText="Sign up now"
                />
            </div>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl">
                    <div className="bg-[#6868AC96] rounded-[2rem] px-12 py-10 shadow-xl relative overflow-hidden">
                        <div className="flex items-center gap-3 text-3xl">
                            <div className="bg-white text-[#9999CC] px-8 py-3 rounded-full font-bold">
                                Always Free
                            </div>
                            <h1 className="text-white font-bold">
                                for Business Buyers
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Pricing
