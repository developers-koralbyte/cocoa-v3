import { useRef, useState } from 'react'
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import cocoavid from '../../components/HomePage/COCOAVID.mp4'
import cocoaimg from '../../components/HomePage/cocoaImgVid.jpeg'

const HowItWorks = () => {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [showPlaceholder, setShowPlaceholder] = useState(true)

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play()
                setIsPlaying(true)
                setShowPlaceholder(false) // Hide placeholder when playing
            } else {
                videoRef.current.pause()
                setIsPlaying(false)
            }
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(videoRef.current.muted)
        }
    }

    return (
        <div className="min-h-screen bg-[#6868AC96] from-purple-50 to-purple-100 relative">
            <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
                <div className="text-left mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white-00 to-purple-800 bg-clip-text text-transparent text-white">
                        How Does It Work?
                    </h2>
                    <p className="text-lg text-black">
                        Interested in COCOA? Here is how we will help you!
                    </p>
                </div>

                {/* Video Section */}
                <div className="relative max-w-4xl mx-auto group cursor-pointer mb-16">
                    {/* Video Element (Always Present) */}
                    <video
                        ref={videoRef}
                        src={cocoavid}
                        className="w-full rounded-xl shadow-xl"
                        muted={isMuted}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    >
                        Your browser does not support the video tag.
                    </video>

                    {/* Placeholder Image (Overlays the Video) */}
                    {showPlaceholder && (
                        <img
                            src={cocoaimg}
                            alt="COCOA Preview"
                            className="absolute top-0 left-0 w-full h-full rounded-xl shadow-xl object-cover"
                        />
                    )}

                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="absolute bottom-4 left-4 bg-white p-3 rounded-full shadow-md"
                    >
                        {isPlaying ? (
                            <FaPause className="text-purple-800" />
                        ) : (
                            <FaPlay className="text-purple-800" />
                        )}
                    </button>

                    {/* Mute/Unmute Button */}
                    {!showPlaceholder && (
                        <button
                            onClick={toggleMute}
                            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md"
                        >
                            {isMuted ? (
                                <FaVolumeMute className="text-purple-800" />
                            ) : (
                                <FaVolumeUp className="text-purple-800" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Wave Decoration */}
            <div className="absolute bottom-[-30px] left-0 right-0">
                <svg
                    viewBox="0 0 1440 240"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,96L40,112C80,128,160,160,240,160C320,160,400,128,480,112C560,96,640,96,720,112C800,128,880,160,960,160C1040,160,1120,128,1200,112C1280,96,1360,96,1400,96L1440,96L1440,240L1400,240C1360,240,1280,240,1200,240C1120,240,1040,240,960,240C880,240,800,240,720,240C640,240,560,240,480,240C400,240,320,240,240,240C160,240,80,240,40,240L0,240Z"
                    ></path>
                </svg>
            </div>
        </div>
    )
}

export default HowItWorks
  