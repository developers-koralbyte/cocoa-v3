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
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-6xl font-bold text-white drop-shadow-md font-nunito">
            What our Users are saying
          </h2>
          <p className="mt-4 text-gray-800 max-w-2xl font-sans">
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

        {/* Featured testimonial */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-8">
            {/* Left side - Image container */}
            <div className="relative bg-[#a8a7a7] rounded-3xl overflow-hidden">
              {/* Quote mark top left */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#6B6BDF] rounded-br-3xl flex items-center justify-center text-4xl text-white">
                "
              </div>
              {/* Image placeholder - you can add your image here */}
              <div className="w-full h-[500px]" />
            </div>

            {/* Right side - Content */}
            <div className="flex items-center">
              <div className="bg-[#838383] rounded-2xl p-8 relative">
                <p className="text-white mb-6">
                  Lorem ipsum dolor sit amet consectetur. Leo facilisis pretium
                  diam imperdiet pellentesque nibh mattis. Adipiscing morbi nibh
                  massa velit posuere etiam faucibus. Nunc sed placerat in
                  ornare amet in sagittis. Eget at congue eu suspendisse
                  convallis eget odio.
                </p>
                {/* Quote mark bottom right */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#6B6BDF] rounded-tl-3xl flex items-center justify-center text-4xl text-white rotate-180">
                  "
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
}

export default UserTestimonial;