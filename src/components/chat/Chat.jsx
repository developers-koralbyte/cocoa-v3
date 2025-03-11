import { useEffect, useRef, useState } from 'react'
import './chat.css'
import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useChatStore } from '../../utils/chatStore'
import { useUserStore } from '../../utils/userStore'
import upload from '../../utils/upload'
import CaptureAudio from '../captureAudio/CaptureAudio'
import whiteCross from '../../assets/img/chatImages/whiteCross.png'

import { format } from 'timeago.js'
import send from '../../assets/img/chatImages/send.png'
import dots from '../../assets/img/chatImages/dots.png'
import documentImage from '../../assets/img/chatImages/document.png'
import sendImage from '../../assets/img/chatImages/img.png'
import cameraIcon from '../../assets/img/chatImages/camera.png'
import micIcon from '../../assets/img/chatImages/mic.png'
import cancel from '../../assets/img/chatImages/cancel.png'
import phoneIcon from '../../assets/img/chatImages/phone.png'
import videoIcon from '../../assets/img/chatImages/video.png'
import capture from '../../assets/img/chatImages/capture.png'
import redoIcon from '../../assets/img/chatImages/redo.png'
import backBtn from '../../assets/img/chatImages/back-icon.png'

const Chat = ({ onBackClick }) => {
    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [img, setImg] = useState({
        file: null,
        url: '',
    })
    const [isRecording, setIsRecording] = useState(false) // Audio recording state
    const [audioBlob, setAudioBlob] = useState(null) // Store recorded audio
    const mediaRecorderRef = useRef(null)
    const [showAudioRecorder, setShowAudioRecorder] = useState(false)

    const [isCameraOpen, setIsCameraOpen] = useState(false) // To control camera modal visibility
    const [cameraStream, setCameraStream] = useState(null) // Webcam stream
    const [capturedImage, setCapturedImage] = useState(null) // Captured image
    const [dropdownOpen, setDropdownOpen] = useState(false) // To toggle dropdown visibility

    const { currentUser, setShowDetailPage, resetShowDetailPage } =
        useUserStore()
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, resetChat } =
        useChatStore()

    const videoRef = useRef(null)
    const modalRef = useRef(null)
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat?.messages])

    useEffect(() => {
        if (chatId) {
            onSnapshot(doc(db, 'chats', chatId), (res) => {
                setChat(res.data())
            })
        }
    }, [chatId])

    const [isChatVisible, setIsChatVisible] = useState(false) // State for toggling chat visibility

    // Close the camera modal when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isCameraOpen &&
                modalRef.current &&
                !modalRef.current.contains(event.target)
            ) {
                setIsCameraOpen(false)
                stopCamera()
            }
            // setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCameraOpen])

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji)
        setOpen(false)
    }

    const handleImg = (e) => {
        setDropdownOpen(false)
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            })
        }
    }

    const handleSend = async (image = null, audio = null, document = null) => {
        if (text === '' && !image && !audio && !document) {
            return (
                <button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            )
        }

        let imgUrl = null
        let audioUrl = null
        let documentUrl = null

        try {
            if (image || img.file) {
                imgUrl = await upload(image || img.file)
            }

            if (audio) {
                audioUrl = await upload(audio)
            }

            if (document) {
                documentUrl = await upload(document)
            }

            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                    ...(audioUrl && { audio: audioUrl }),
                    ...(documentUrl && {
                        document: documentUrl,
                        documentName: document.name,
                    }), // Add document URL and name
                }),
            })

            if (!currentUser?.id || !user?.id) {
                console.error("User data is missing, cannot send message.");
                return;
              }
              
              const userIDs = [currentUser.id, user.id];
              
            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, 'userchats', id)
                const userChatsSnapshot = await getDoc(userChatsRef)

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data()

                    const chatIndex = userChatsData.chats.findIndex(
                        (c) => c.chatId === chatId
                    )

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text
                        userChatsData.chats[chatIndex].isSeen =
                            id === currentUser.id ? true : false
                        userChatsData.chats[chatIndex].updatedAt = Date.now()

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        })
                    }
                }
            })
        } catch (err) {
            console.log(err)
        } finally {
            setImg({
                file: null,
                url: '',
            })
            setText('')
            setCapturedImage(null) // Reset the captured image
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isCurrentUserBlocked && !isReceiverBlocked) {
            handleSend()
        }
    }

    // Start recording audio
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder

            const audioChunks = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data)
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
                setAudioBlob(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
        })
    }

    // Stop recording audio
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    // Send recorded audio and reset state to show icons
    const sendAudio = () => {
        if (audioBlob) {
            handleSend(null, audioBlob)

            // Reset the audio recording state and remove the Send Voice button
            setAudioBlob(null)
            setIsRecording(false)
        }
    }

    // Open camera modal and start video stream
    const openCamera = async () => {
        setIsCameraOpen(true)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        })
        setCameraStream(stream)
        videoRef.current.srcObject = stream
    }

    // Capture the image from the video stream
    const captureImage = () => {
        const video = videoRef.current
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/png')
        setCapturedImage(dataUrl)
        stopCamera()
    }

    // Stop camera stream
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop())
            setCameraStream(null)
        }
    }

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen) // Toggle the dropdown
    }

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const menuRef = useRef(null)

    // Redo capture (open camera again)
    const redoCapture = () => {
        setCapturedImage(null)
        openCamera()
    }

    // Send captured image and close the modal
    const sendCapturedImage = () => {
        fetch(capturedImage)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], 'captured.png', {
                    type: 'image/png',
                })
                handleSend(file)
                setIsCameraOpen(false) // Close the modal after sending the image
            })
    }

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible)
    }

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setDropdownOpen(false)
        }
    }

    useEffect(() => {
        // Add event listener to detect clicks outside the dropdown
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            // Clean up the event listener when the component unmounts
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return chatId ? (
        <>
            {/* Toggle button for mobile to show/hide chat */}

            <div className={'chat'}>
                <div className="top bg-darkPurple">
                    <div className="user">
                        {isMobile && (
                            <img
                                className="back-btn"
                                src={backBtn}
                                onClick={onBackClick}
                            />
                        )}
                        <img
                            className="user-avatar"
                            src={user?.avatar || './avatar.png'}
                            alt=""
                        />

                        <div
                            className="texts "
                            onClick={() => setShowDetailPage()}
                        >
                            <span>{user?.firstName}</span>
                        </div>
                    </div>
                    <div className="icons">
                        {!isMobile && (
                            <img
                                src={whiteCross}
                                alt=""
                                onClick={() => {
                                    resetChat()
                                    resetShowDetailPage()
                                }}
                                width={25}
                                height={25}
                            />
                        )}
                    </div>
                </div>
                <div className="center">
                    {chat?.messages?.map((message, index) => {
                        // Determine if current user is sender
                        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                        const currentUserId = currentUser?.docId || currentUser?.uid || storedUser?.uid;
                        const isCurrentUser = message.senderId === currentUserId;
                        
                        return (
                            <div
                                key={index}
                                className={`flex mb-3 sm:mb-4 ${
                                    isCurrentUser
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                {!isCurrentUser && (
                                    <img
                                        src={
                                            user?.avatar ||
                                            './avatar.png'
                                        }
                                        alt=""
                                        className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3 self-start mt-1"
                                    />
                                )}
                                <div
                                    className={`w-auto max-w-[75%] sm:max-w-xs md:max-w-md px-3 sm:px-4 py-2 sm:py-3 ${
                                        isCurrentUser
                                            ? 'bg-[#5F4B8BB0] text-white rounded-[20px] rounded-br-none'
                                            : 'bg-[#AFAFAF9C] text-gray-800 rounded-[20px] rounded-bl-none'
                                    } overflow-hidden`}
                                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                >
                                    {message.img && (
                                        <img
                                            src={message.img}
                                            alt="Attachment"
                                            className="rounded mb-2 max-w-full h-auto object-contain"
                                            style={{ maxHeight: '200px' }}
                                        />
                                    )}
                                    
                                    {message.document && (
                                        <div className="mb-2 border rounded p-2 bg-white bg-opacity-10">
                                            <a 
                                                href={message.document} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center hover:underline"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                                <span className="flex-1 truncate">
                                                    {message.documentName || 'View Document'}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                            {message.documentName && message.documentName.toLowerCase().endsWith('.pdf') && (
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => window.open(message.document, '_blank')}
                                                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                    >
                                                        View PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {message.audio && (
                                        <audio controls src={message.audio} className="w-full mb-2" />
                                    )}
                                    
                                    <p className="text-sm sm:text-base overflow-hidden">
                                        {message.text}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <div
                                            className={`text-[10px] sm:text-xs ${
                                                isCurrentUser
                                                    ? 'text-purple-200'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {message.createdAt && (() => {
                                                try {
                                                    // Handle different timestamp formats
                                                    if (typeof message.createdAt.toDate === 'function') {
                                                        // Firestore Timestamp
                                                        return format(message.createdAt.toDate());
                                                    } else if (message.createdAt instanceof Date) {
                                                        // JavaScript Date object
                                                        return format(message.createdAt);
                                                    } else if (typeof message.createdAt === 'object' && message.createdAt.seconds) {
                                                        // Firestore timestamp that was serialized
                                                        return format(new Date(message.createdAt.seconds * 1000));
                                                    } else {
                                                        // Try as a date string or timestamp
                                                        return format(new Date(message.createdAt));
                                                    }
                                                } catch (e) {
                                                    console.error("Error formatting date:", e);
                                                    return "Just now";
                                                }
                                            })()}
                                        </div>
                                        <div className="text-[10px] sm:text-xs ml-2">
                                            {isCurrentUser ? '(You)' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {img.url && (
                        <div className="message own">
                            <div className="texts">
                                <img src={img.url} alt="" />
                            </div>
                        </div>
                    )}
                    <div ref={endRef}></div>
                </div>
                {!showAudioRecorder && (
                    <div className="bottom">
                        <div className="icons1">
                            {/* More options button (three dots) - only shown on mobile */}
                            <div className="options-menu1" ref={menuRef}>
                                <button
                                    className="more-options-btn"
                                    onClick={toggleDropdown}
                                >
                                    <img src={dots} alt="More options" />
                                </button>
                            </div>

                            {/* Dropdown Menu (drop-up), only visible on mobile */}
                            {dropdownOpen && (
                                <div className="dropdown-menu" ref={menuRef}>
                                    <label
                                        htmlFor="file"
                                        className="dropdown-item"
                                    >
                                        <img src={sendImage} alt="Send Image" />
                                        <span>Send Image</span>
                                        <input
                                            type="file"
                                            id="file"
                                            style={{ display: 'none' }}
                                            onChange={handleImg}
                                        />
                                    </label>

                                    <div
                                        className="dropdown-item"
                                        onClick={openCamera}
                                    >
                                        <img
                                            src={cameraIcon}
                                            alt="Open Camera"
                                        />
                                        <span>Open Camera</span>
                                    </div>

                                    <div className="dropdown-item">
                                        <label
                                            htmlFor="document"
                                            className="dropdown-item"
                                        >
                                            <img
                                                src={documentImage}
                                                alt="Send Document"
                                            />
                                            <span>Send Document</span>
                                            <input
                                                type="file"
                                                id="document"
                                                style={{ display: 'none' }}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" // Accept common document types
                                                onChange={(e) =>
                                                    handleSend(
                                                        null,
                                                        null,
                                                        e.target.files[0]
                                                    )
                                                } // Pass the document file to handleSend
                                            />
                                        </label>
                                    </div>

                                    {audioBlob && (
                                        <div
                                            className="dropdown-item"
                                            onClick={sendAudio}
                                        >
                                            <img src={send} alt="Send Voice" />
                                            <span>Send Voice</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <input
                            // className="sendMessage"
                            className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                            type="text"
                            placeholder={
                                isCurrentUserBlocked || isReceiverBlocked
                                    ? 'You cannot send a message'
                                    : 'Type a message...'
                            }
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isCurrentUserBlocked || isReceiverBlocked}
                        />

                        {text === '' ? (
                            <img
                                onClick={() => setShowAudioRecorder(true)}
                                disabled={text === ''}
                                src={micIcon}
                                className="send-btn"
                                alt="Send"
                            />
                        ) : (
                            <img
                                onClick={() => handleSend()}
                                disabled={text === ''}
                                src={send}
                                className="send-btn"
                                alt="micIcon"
                            />
                        )}
                    </div>
                )}
                {showAudioRecorder && (
                    <CaptureAudio
                        hide={setShowAudioRecorder}
                        handleSend={handleSend}
                    />
                )}

                {/* Modal for Webcam and Captured Image */}
                {isCameraOpen && (
                    <div className="modal-overlay">
                        <div className="modal" ref={modalRef}>
                            <div className="modal-content">
                                {capturedImage ? (
                                    <>
                                        <img
                                            src={capturedImage}
                                            alt="Captured"
                                        />
                                        <div className="icon-actions">
                                            <img
                                                src={cancel}
                                                alt="Cancel"
                                                onClick={() =>
                                                    setIsCameraOpen(false)
                                                }
                                            />
                                            <img
                                                src={redoIcon}
                                                alt="Redo"
                                                onClick={redoCapture}
                                            />
                                            <img
                                                src={send}
                                                alt="Send"
                                                onClick={sendCapturedImage}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                        />
                                        <div className="icon-actions">
                                            <img
                                                src={cancel}
                                                alt="Cancel"
                                                onClick={() =>
                                                    setIsCameraOpen(false)
                                                }
                                            />
                                            <img
                                                src={capture}
                                                alt="Capture"
                                                onClick={captureImage}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    ) : (
        <div className="background-container">
            <div className="background-content">
                <h3>SELECT A CHAT TO START</h3>
            </div>
        </div>
    )
}

export default Chat