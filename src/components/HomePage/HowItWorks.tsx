import { useRef, useState, useEffect } from 'react'
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import cocoaimg from '../../components/HomePage/cocoaImageVid.jpeg'
import CocoaVideo from '../../assets/CocoaVideo.mp4'

const HowItWorks = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [showPlaceholder, setShowPlaceholder] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

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

    // Detect screen size for mobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <div className="bg-[#6868AC96] from-purple-50 to-purple-100 relative">
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
                <div className="text-left mb-12">
                    <h2 className="text-4xl sm:text-4xl font-nunito font-bold mb-4 bg-gradient-to-r from-white-00 to-purple bg-clip-text text text-white text-center">
                        Interested in COCOA? Here is how we will help you!
                    </h2>
                </div>

                {/* Video Section */}
                <div className="relative max-w-4xl mx-auto group cursor-pointer mb-28 xl:mb-36 2xl:mb-48 z-10">
                    {/* Video Element (Always Present) */}
                    <video
                        ref={videoRef}
                        src={CocoaVideo}
                        className="w-full max-h-[75vh] rounded-xl shadow-xl object-cover"
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
            <div
                className="absolute left-0 right-0 z-0"
                style={{
                    bottom: isMobile ? '-20px' : '-30px',
                    transform: isMobile ? 'scaleX(2.2)' : 'none',
                }}
            >
                <svg
                    viewBox="0 0 1440 250"
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid slice"
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