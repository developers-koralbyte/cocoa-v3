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

            const userIDs = [currentUser.id, user.id]

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
                <div className="top">
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
                            className="texts"
                            onClick={() => setShowDetailPage()}
                        >
                            <span>{user?.username}</span>
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
                    {chat?.messages?.map((message) => (
                        <div
                            className={
                                message.senderId === currentUser?.id
                                    ? 'message own'
                                    : 'message'
                            }
                            key={message?.createAt}
                        >
                            <div className="texts">
                                {message.img && (
                                    <img src={message.img} alt="" />
                                )}
                                {message.text && <p>{message.text}</p>}
                                {message.audio && (
                                    <audio controls src={message.audio} />
                                )}
                                {message.document && (
                                    <a
                                        href={message.document}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {message.documentName ||
                                            'View Document'}
                                    </a>
                                )}
                                <span>
                                    {format(message.createdAt.toDate())}
                                </span>
                            </div>
                        </div>
                    ))}
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
                            className="sendMessage"
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
