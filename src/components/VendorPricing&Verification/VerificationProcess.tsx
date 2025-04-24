import React from 'react';
import { IoPersonOutline, IoDocumentTextOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom'


const VerificationProcess: React.FC = () => {
  const navigate = useNavigate()

  return (
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                  {/* Left side - Image and Verification UI */}
                  <div className="lg:w-1/2 relative max-w-md mx-auto">
                      <img
                          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                          alt="Business people celebrating success"
                          className="rounded-lg shadow-xl w-full h-auto mb-8"
                      />
                      <div className="absolute bottom-0 right-0 transform translate-y-1/4 bg-white p-6 rounded-lg shadow-xl w-72">
                          <div className="flex justify-center mb-4">
                              <IoCheckmarkCircleOutline className="text-green-500 w-16 h-16" />
                          </div>
                          <p className="text-center text-sm text-gray-600">
                              Your Account is Now Verified!
                          </p>
                      </div>
                  </div>

                  {/* Right side - Process Steps */}
                  <div className="lg:w-1/2">
                      <h2 className="text-4xl lg:text-5xl font-bold text-[#6B5BA9] mb-6">
                          Verification Process
                      </h2>
                      <p className="text-lg text-gray-600 mb-10">
                          Follow these simple steps to get your business up and
                          running on our platform. It's quick and
                          straightforward, with clear instructions at every
                          stage. Here's how it works:
                      </p>

                      <div className="space-y-8">
                          {/* Step 1 */}
                          <div className="flex items-center">
                              <div className="w-4 h-full bg-[#6B5BA9] mr-4"></div>
                              <div>
                                  <h3 className="text-2xl font-semibold text-[#6B5BA9]">
                                      STEP 1: Profile Creation
                                  </h3>
                              </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-center">
                              <div className="w-4 h-full bg-[#6B5BA9] mr-4"></div>
                              <div>
                                  <h3 className="text-2xl font-semibold text-[#6B5BA9]">
                                      STEP 2: Document Submission
                                  </h3>
                              </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-center">
                              <div className="w-4 h-full bg-[#6B5BA9] mr-4"></div>
                              <div>
                                  <h3 className="text-2xl font-semibold text-[#6B5BA9]">
                                      STEP 3: Verification Review
                                  </h3>
                              </div>
                          </div>
                      </div>

                      <button
                          onClick={() => navigate('/create-account')}
                          className="mt-10 bg-[#6B5BA9] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5D4C7C] transition-colors duration-300"
                      >
                          START NOW
                      </button>
                  </div>
              </div>
          </div>
      </section>
  )
};

export default VerificationProcess;