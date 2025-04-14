import fourCards from '../../assets/img/sectionTwo/four_cards.png'
import { useNavigate } from 'react-router-dom'
import fourCardNew from '../../assets/img/sectionTwo/four-card-new.png'

const CollaborationSection = () => {
    const navigate = useNavigate()

    return (
        <section className="flex flex-col md:flex-row items-center justify-between px-4 md:px-28 py-0 bg-white">
            {/* Left side: Image */}
            <div className="md:w-1/2 flex justify-center md:justify-start">
                <img
                    src={fourCardNew}
                    alt="COCOA four-cards composite"
                    className="max-w-full h-auto rounded-lg"
                />
            </div>

            {/* Right side: Text */}
            <div className="md:w-1/2 -mt-6 md:-mt-20 text-center md:text-left max-w-xl md:pl-12">
                <h1 className="text-[32px] md:text-[39px] font-bold text-gray-800 leading-[3.2rem] font-nunito">
                    Connect, chat, collaborate and grow with COCOA
                </h1>
                <p className="text-[18px] mt-4 font-sourceSans text-gray-700">
                    Revolutionize procurement with our chat-based platform.{' '}
                    <br />
                    Experience instant messaging and streamlined workflows that
                    empower quicker, more informed business decisions.
                </p>
                <button
                    className="mt-6 px-14 text-[18px] py-3 bg-buttonBg text-white font-semibold rounded-full shadow-md font-sourceSans"
                    onClick={() => navigate('/login')}
                >
                    Start Exploring
                </button>
            </div>
        </section>
    )
}

export default CollaborationSection
