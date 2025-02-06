import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'
import Header from '../../components/Dashboard/Invoices/HeaderProps'
import { useUserStore } from '../../utils/userStore'
import { auth } from '../../utils/firebase'

const InvoicesPage = () => {
    const navigate = useNavigate()
    const { currentUser, fetchUserInfo } = useUserStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    await fetchUserInfo(user.uid)
                } catch (error) {
                    console.error('Error fetching user info:', error)
                    navigate('/login')
                }
            } else {
                navigate('/login')
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [fetchUserInfo, navigate])

    if (isLoading) {
        return (
            <BaseLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]"></div>
                </div>
            </BaseLayout>
        )
    }

    return (
        <>
            <BaseLayout>
                <div className="p-6">
                    {/* Header Section */}
                    <Header
                        userName={currentUser?.username || 'User'}
                        userRole={currentUser?.role || 'Buyer'}
                        userImage={
                            currentUser?.avatar || '/path-to-default-avatar.jpg'
                        }
                        title={'Invoices'}
                    />

                    {/* Invoice History Section */}
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl text-[#8B85C1]">
                                Invoices History
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Invoice Table will go here */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            {/* Table component will be added here */}
                        </div>
                    </div>
                </div>
            </BaseLayout>

            {/* Chat Image/Button */}
            <div
                className="fixed bottom-3 right-10 cursor-pointer z-50"
                onClick={() => navigate('/chat')}
            >
                <img
                    src={chatImage}
                    alt="Chat"
                    className="hover:opacity-90 transition-opacity"
                />
            </div>
        </>
    )
}

export default InvoicesPage
