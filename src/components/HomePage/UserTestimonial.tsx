interface Testimonial{
  id: number;
  name: string;
  role: string;
  content: string;
}

{/*Random Testimonials for testing */}
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Product Manager",
    content: "Great experience working with the team!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Developer",
    content: "Excellent support and features",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Designer",
    content: "Intuitive and powerful platform",
  },
  {
    id: 4,
    name: "James Wilson",
    role: "CEO",
    content: "Game-changing for our business",
  },
];


const UserTestimonial = () =>{
  return (
    <section className="py-16 px-4 bg-[#c3c0e6]">
      <div className="max-w-7xl mx-auto flex-auto">
        <div className="mb-12 text-center">
          <h2 className="font-nunito text-[60px] font-extrabold text-black drop-shadow-md font-nunito">
          A successful journey always begins with <br/>strong collaboration!
          </h2>

        </div>

        {/* Top testimonial cards */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-300 rounded-2xl p-4 flex items-center"
            >
              <div className="w-10 h-10 bg-white rounded-full mr-3" />
              <div className="text-sm text-gray-600 truncate">
                {testimonial.content}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial container */}
        <div className="relative mt-8 flex justify-center items-center">
          <div className="flex items-start gap-0 relative">
            {/* Image box */}
            <div className="w-[500px] h-[400px] bg-[#D3D3E7] rounded-[32px] overflow-hidden">
              {/* Placeholder for your image */}
              <div className="w-full h-full bg-[#C4C4C4]" />
            </div>

            {/* Text box */}
            <div className="w-[550px] bg-[#dbdbde] rounded-[32px] p-8 ml-[-32px] mt-[100px] ">
              <p className="text-gray-700 mb-6">
              In today's evolving enterprise procurement landscape, large providers dominate the market, creating high barriers for businesses seeking corporate and software solutions. COCOA disrupts this dynamic by providing an accessible platform that connects enterprises directly with verified solution providers through real-time chat communication. From ERP implementations to corporate services, we enable transparent negotiations, competitive pricing, and efficient partnerships.
              </p>
              <p className="text-gray-600 font-medium italic">
                COCOA CEO Ibne Ali
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
  
}

export default UserTestimonial;