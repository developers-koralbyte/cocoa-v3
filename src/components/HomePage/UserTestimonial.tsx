import imgOne from '../../components/HomePage/userOne.jpeg'
import imgTwo from '../../components/HomePage/userTwo.jpeg'
import imgThree from '../../components/HomePage/userThree.jpeg'
interface Testimonial {
    id: number
    name: string
    role: string
    content: string
    image: string
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Yihao Heidi',
        role: 'COCOA Graphic Designer',
        content:
            'No need to waste extra effort! COCOA will provide smooth communication between suppliers and buyers.',
        image: imgOne,
    },
    {
        id: 2,
        name: 'Harsh Dugar',
        role: 'Software Developer',
        content:
            'COCOA simplifies procurement, you can connect, collaborate, and grow your business effortlessly.',
        image: imgTwo,
    },
    {
        id: 3,
        name: 'Manuela Romero',
        role: 'COCOA Graphic Designer',
        content:
            'COCOA will help you tackle multiple tasks needed for your business, all in one platform!',
        image: imgThree,
    },
]

const UserTestimonial = () => {
    return (
        <section className="py-12 px-4 bg-[#E8E6F6]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h2 className="text-[50px] text-black leading-tight font-nunito font-bold text-left pl-32">
                        A successful journey always begins with
                        <br />
                        strong collaboration!
                    </h2>
                </div>

                {/* Main content section */}
                <div className="flex flex-col lg:flex-row gap-8 items-center mb-4">
                    {/* Left side - Placeholder for photo */}
                    <div className="lg:w-1/2">{/* PHOTO WILL GO HERE */}</div>

                    {/* Right side - Quote content */}
                    <div className="lg:w-2/3">
                        <div className="backdrop-blur-sm rounded-3xl p-8">
                            <p className="text-gray-800 text-lg mb-6 font-sourceSans leading-loose">
                                "In today's evolving enterprise procurement
                                landscape, large providers dominate the market,
                                creating high barriers for businesses seeking
                                corporate and software solutions. COCOA disrupts
                                this dynamic by providing an accessible platform
                                that connects enterprises directly with verified
                                solution providers through real-time chat
                                communication. From ERP implementations to
                                corporate services, we enable transparent
                                negotiations, competitive pricing, and efficient
                                partnerships."
                            </p>
                            <p className="text-gray-900 italic font-nunito text-lg">
                                Ibne Ali, COCOA CEO
                            </p>
                            <h4 className="text-2xl font-bold text-gray-900 font-nunito pt-4">
                                We're proud to help people like you succeed!
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Testimonial cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-[#9B97D1] rounded-[32px] p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-16 h-16 rounded-full object-fill font-nunito"
                                />
                                <div className="flex-1">
                                    <p className="text-sm leading-relaxed mb-2 font-sourceSans">
                                        {testimonial.content}
                                    </p>
                                    <div className="text-xs opacity-90 italic font-nunito">
                                        {testimonial.name}, {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>
        </section>
    )
}

export default UserTestimonial
