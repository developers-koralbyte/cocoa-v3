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
          <h2 className="text-6xl font-bold text-white drop-shadow-md font-nunito">
            What our Users are saying
          </h2>
          <p className="mt-4 text-gray-800 max-w-2xl font-sans mx-auto">
            We're proud to help people like you succeed! But don't just take our
            word for it—here's what some of our happy users have to say:
          </p>
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
                The growing oligopoly in the HORECA supply is a major barrier
                for small businesses, as a few suppliers dominate, driving up
                costs and limiting access for smaller players. COCOA was built
                to level the playing field by connecting buyers directly with
                diverse vendors, enabling fair pricing, real-time negotiations
                and lasting partnerships. We're excited to empower small
                businesses in the food industry with an accessible, fair
                platform design for their success.
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