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
import DefaultAvatar from '../Dashboard/Invoices/DefaultAvatar'

import { format } from 'timeago.js'
import send from '../../assets/img/chatImages/send.png'
import dots from '../../assets/img/chatImages/dots.png'
import documentImage from '../../assets/img/chatImages/document.png'
import sendImage from '../../assets/img/chatImages/img.png'
import cameraIcon from '../../assets/img/chatImages/camera.png'
import micIcon from '../../assets/img/chatImages/mic.png'
import backBtn from '../../assets/img/chatImages/back-icon.png'
import ImprovedPdfViewer from './ImprovedPdfViewer'

// Document Preview Component for selected documents before sending
const DocumentPreview = ({ document, onRemove }) => {
    // Get icon based on file type
    const getDocumentIcon = () => {
        const type = document.type.toLowerCase()
        if (type.includes('pdf')) return '📄'
        if (type.includes('word') || type.includes('doc')) return '📝'
        if (
            type.includes('sheet') ||
            type.includes('excel') ||
            type.includes('xls')
        )
            return '📊'
        if (type.includes('presentation') || type.includes('ppt')) return '📑'
        return '📎'
    }

    return (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center shadow-sm">
            <span className="text-xl mr-2">{getDocumentIcon()}</span>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{document.name}</p>
                <p className="text-xs text-gray-500">{document.size}</p>
            </div>
            <button
                onClick={onRemove}
                className="ml-2 text-red-500 hover:text-red-700 rounded-full w-6 h-6 flex items-center justify-center"
            >
                ×
            </button>
        </div>
    )
}

// Simple direct document display without relying on CSS classes
const SimpleDocumentDisplay = ({
    document,
    filename,
    documentType,
    invoiceId,
}) => {
    console.log('SIMPLE DOCUMENT DISPLAY PROPS:', {
        document,
        filename,
        documentType,
        invoiceId,
    })

    if (!document) {
        console.error('Missing document URL in SimpleDocumentDisplay')
        return (
            <div className="p-2 bg-red-100 text-red-500 rounded">
                Error: Missing document URL
            </div>
        )
    }

    // Determine document type icon
    let icon = '📎'
    if (
        filename?.toLowerCase().endsWith('.pdf') ||
        documentType?.toLowerCase().includes('pdf')
    ) {
        icon = '📄'
    }

    return (
        <div
            style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>
                {icon}
            </span>
            <div style={{ flexGrow: 1 }}>
                <div
                    style={{
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {filename || 'Document'}
                </div>
                {invoiceId && (
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        Invoice PDF
                    </div>
                )}
            </div>
            <a
                href={document}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    marginLeft: '10px',
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    console.log('Opening document URL:', document)
                    window.open(document, '_blank')
                }}
            >
                View
            </a>
        </div>
    )
}

// The original version with CSS classes
// Enhanced Document Attachment Component with inline styles as fallback
const DocumentAttachment = ({
    document,
    filename,
    documentType,
    invoiceId,
}) => {
    console.log('Rendering DocumentAttachment with:', {
        document,
        filename,
        documentType,
        invoiceId,
    })

    if (!document) {
        console.error('Missing document URL')
        return null
    }

    // Determine document type from filename or explicit type
    const getDocumentIcon = () => {
        const filenameStr = filename?.toLowerCase() || ''
        const typeStr = documentType?.toLowerCase() || ''

        if (typeStr.includes('pdf') || filenameStr.endsWith('.pdf')) return '📄'
        if (
            typeStr.includes('word') ||
            typeStr.includes('doc') ||
            filenameStr.endsWith('.doc') ||
            filenameStr.endsWith('.docx')
        )
            return '📝'
        if (
            typeStr.includes('excel') ||
            typeStr.includes('sheet') ||
            filenameStr.endsWith('.xls') ||
            filenameStr.endsWith('.xlsx') ||
            filenameStr.endsWith('.csv')
        )
            return '📊'
        if (
            typeStr.includes('presentation') ||
            typeStr.includes('ppt') ||
            filenameStr.endsWith('.ppt') ||
            filenameStr.endsWith('.pptx')
        )
            return '📑'
        return '📎'
    }

    const isPdf =
        filename?.toLowerCase().endsWith('.pdf') ||
        documentType?.toLowerCase().includes('pdf')
    const isInvoice = !!invoiceId

    // Generate class names
    const attachmentClass = `document-attachment ${isPdf ? 'pdf' : ''} ${isInvoice ? 'invoice-pdf' : ''}`

    // Fallback inline styles (in case CSS classes don't work)
    const containerStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderLeftWidth: isPdf ? '4px' : '1px',
        borderLeftColor: isInvoice
            ? '#3182ce'
            : isPdf
              ? '#e53e3e'
              : 'rgba(255, 255, 255, 0.5)',
        width: '100%',
    }

    const iconStyle = {
        fontSize: '24px',
        marginRight: '10px',
        minWidth: '24px',
    }

    const detailsStyle = {
        flex: '1',
        overflow: 'hidden',
    }

    const nameStyle = {
        fontWeight: '500',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }

    const metaStyle = {
        fontSize: '0.75rem',
        opacity: '0.7',
    }

    const buttonStyle = {
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        marginLeft: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: '60px',
        justifyContent: 'center',
    }

    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        color: 'inherit',
        textDecoration: 'none',
        width: '100%',
    }

    return (
        <div className={attachmentClass} style={containerStyle}>
            <a
                href={document}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full"
                style={linkStyle}
                onClick={(e) => {
                    e.preventDefault() // Prevent default to handle click ourselves
                    console.log('Document link clicked:', document)
                    window.open(document, '_blank')
                }}
            >
                <span className="icon" style={iconStyle}>
                    {getDocumentIcon()}
                </span>
                <div className="details" style={detailsStyle}>
                    <div className="name" style={nameStyle}>
                        {filename || 'Document'}
                    </div>
                    {isInvoice && (
                        <div className="meta" style={metaStyle}>
                            Invoice PDF
                        </div>
                    )}
                </div>
            </a>

            {isPdf && (
                <button
                    className="view-pdf-button"
                    style={buttonStyle}
                    onClick={(e) => {
                        e.stopPropagation()
                        console.log('View PDF button clicked:', document)
                        window.open(document, '_blank')
                    }}
                >
                    View
                </button>
            )}
        </div>
    )
}

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

    // State for document handling
    const [document, setDocument] = useState(null)
    const [documentPreview, setDocumentPreview] = useState(null)

    // Debug state to count document messages
    const [documentCount, setDocumentCount] = useState(0)

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
            console.log('CHAT ID CHANGE - SUBSCRIBING TO MESSAGES:', chatId)
            const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (res) => {
                const chatData = res.data()
                console.log('CHAT DATA RECEIVED:', chatData)

                // Count document messages for debugging
                if (chatData && chatData.messages) {
                    const docs = chatData.messages.filter((msg) => msg.document)
                    console.log(`FOUND ${docs.length} DOCUMENT MESSAGES`)
                    setDocumentCount(docs.length)
                }

                setChat(chatData)
            })

            return () => unsubscribe()
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
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCameraOpen])

    // Helper function to get the current user ID
    const getCurrentUserId = () => {
        if (currentUser?.id) {
            return currentUser.id
        }
        // Fall back to localStorage if needed
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const userData = JSON.parse(storedUser)
            return userData.id || userData.uid // Support older format
        }
        return null
    }

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

    // Handle document selection
    const handleDocumentChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            console.log('Document selected:', file.name, file.type, file.size)

            // Store the document in state
            setDocument(file)
            setDocumentPreview({
                name: file.name,
                type: file.type,
                size: (file.size / 1024).toFixed(1) + ' KB',
            })

            // Close dropdown if it's open
            setDropdownOpen(false)
        }
    }

    const handleSend = async (image = null, audio = null) => {
        // Check if we have something to send
        if (text.trim() === '' && !image && !img.file && !audio && !document) {
            return (
                <button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            )
        }

        let imgUrl = null
        let audioUrl = null
        let documentUrl = null
        let documentName = null
        let documentType = null

        try {
            console.log('Starting to send message...')

            // Upload image if present
            if (image || img.file) {
                console.log('Uploading image...')
                imgUrl = await upload(image || img.file)
            }

            // Upload audio if present
            if (audio) {
                console.log('Uploading audio...')
                audioUrl = await upload(audio)
            }

            // Upload document if present
            if (document) {
                console.log('Uploading document:', document.name)
                documentUrl = await upload(document)
                documentName = document.name
                documentType = document.type
                console.log('Document uploaded successfully:', documentUrl)
            }

            const currentUserId = getCurrentUserId()

            if (!currentUserId) {
                console.error('User ID not available - cannot send message')
                return
            }

            // Create message object with all attachments
            const messageData = {
                senderId: currentUserId,
                text: text.trim(),
                createdAt: new Date(),
                ...(imgUrl && { img: imgUrl }),
                ...(audioUrl && { audio: audioUrl }),
                ...(documentUrl && {
                    document: documentUrl,
                    documentName: documentName,
                    documentType: documentType,
                }),
            }

            console.log('Sending message with data:', messageData)

            // Add message to chat
            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion(messageData),
            })

            // Update last message for both users
            if (!user?.id) {
                console.error(
                    'Recipient user ID is missing, cannot update user chats'
                )
                return
            }

            const lastMessageText =
                text.trim() ||
                (documentUrl
                    ? `📄 Document: ${documentName}`
                    : imgUrl
                      ? '🖼️ Image'
                      : audioUrl
                        ? '🎵 Audio'
                        : 'Attachment')

            const userIDs = [currentUserId, user.id]

            for (const id of userIDs) {
                try {
                    const userChatsRef = doc(db, 'userchats', id)
                    const userChatsSnapshot = await getDoc(userChatsRef)

                    if (userChatsSnapshot.exists()) {
                        const userChatsData = userChatsSnapshot.data()
                        const chats = userChatsData.chats || []
                        const chatIndex = chats.findIndex(
                            (c) => c.chatId === chatId
                        )

                        if (chatIndex !== -1) {
                            // Create a new array to ensure the update triggers correctly
                            const updatedChats = [...chats]
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: lastMessageText,
                                isSeen: id === currentUserId, // Only sender has seen the message
                                updatedAt: Date.now(),
                            }

                            await updateDoc(userChatsRef, {
                                chats: updatedChats,
                            })
                        }
                    }
                } catch (error) {
                    console.error(`Error updating userchats for ${id}:`, error)
                }
            }

            console.log('Message sent successfully')
        } catch (err) {
            console.error('Error sending message:', err)
        } finally {
            // Reset states
            setText('')
            setImg({ file: null, url: '' })
            setDocument(null)
            setDocumentPreview(null)
            setCapturedImage(null)
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
                setIsCameraOpen(false)
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
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Update to detect window size changes for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Initial check

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Debug checker - inspect what CSS files are loaded
    useEffect(() => {
        console.log('CHECKING CSS STYLES:')
        const styleSheets = document.styleSheets
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const href = styleSheets[i].href || 'inline'
                console.log(`StyleSheet ${i}: ${href}`)

                // Try to find document-attachment classes
                try {
                    const rules =
                        styleSheets[i].cssRules || styleSheets[i].rules
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            const rule = rules[j]
                            if (
                                rule.selectorText &&
                                rule.selectorText.includes(
                                    'document-attachment'
                                )
                            ) {
                                console.log(
                                    `FOUND DOCUMENT ATTACHMENT STYLE: ${rule.selectorText} in ${href}`
                                )
                                console.log(rule.cssText)
                            }
                        }
                    }
                } catch (err) {
                    console.log(
                        `Cannot access rules in stylesheet ${href}: ${err.message}`
                    )
                }
            } catch (e) {
                console.log(`Error accessing stylesheet ${i}: ${e.message}`)
            }
        }
    }, [])

    return chatId ? (
        <>
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
                        <DefaultAvatar
                            user={user}
                            className="user-avatar"
                            size="md"
                            defaultImage="./avatar.png"
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

                {/* Debug info */}
                <div
                    style={{
                        padding: '10px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '12px',
                    }}
                >
                    <div>Documents in chat: {documentCount}</div>
                    <div>Chat ID: {chatId}</div>
                    <div>Messages: {chat?.messages?.length || 0}</div>
                </div>

                <div className="center">
                    {chat?.messages?.map((message, index) => {
                        const currentUserId = getCurrentUserId()
                        const isCurrentUser = message.senderId === currentUserId

                        console.log('Rendering message:', {
                            id: index,
                            hasPDF: !!message.document,
                            documentURL: message.document,
                            documentName: message.documentName,
                            documentType: message.documentType,
                            invoiceId: message.invoiceId,
                        })

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
    <DefaultAvatar
        user={user}
        size="sm"
        className="flex-shrink-0 mr-2 sm:mr-3 self-start mt-1"
        defaultImage="./avatar.png"
    />
)}
                                <div
                                    className={`w-auto max-w-[75%] sm:max-w-xs md:max-w-md px-3 sm:px-4 py-2 sm:py-3 ${
                                        isCurrentUser
                                            ? 'bg-[#5F4B8BB0] text-white rounded-[20px] rounded-br-none'
                                            : 'bg-[#AFAFAF9C] text-gray-800 rounded-[20px] rounded-bl-none'
                                    } overflow-hidden`}
                                    style={{
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {/* Document attachment - using improved component */}
                                    {message.document && (
                                        <ImprovedPdfViewer
                                            pdfUrl={message.document}
                                            filename={message.documentName}
                                            invoiceId={message.invoiceId}
                                            isCurrentUser={isCurrentUser}
                                        />
                                    )}

                                    {/* Image attachment */}
                                    {message.img && (
                                        <img
                                            src={message.img}
                                            alt="Attachment"
                                            className="rounded mb-2 max-w-full h-auto object-contain"
                                            style={{ maxHeight: '200px' }}
                                        />
                                    )}

                                    {/* Audio attachment */}
                                    {message.audio && (
                                        <audio
                                            controls
                                            src={message.audio}
                                            className="w-full mb-2"
                                        />
                                    )}

                                    {/* Message text */}
                                    {message.text && (
                                        <p className="text-sm sm:text-base overflow-hidden">
                                            {message.text}
                                        </p>
                                    )}

                                    {/* Message metadata */}
                                    <div className="flex justify-between items-center mt-1">
                                        <div
                                            className={`text-[10px] sm:text-xs ${
                                                isCurrentUser
                                                    ? 'text-purple-200'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {message.createdAt &&
                                                (() => {
                                                    try {
                                                        if (
                                                            typeof message
                                                                .createdAt
                                                                .toDate ===
                                                            'function'
                                                        ) {
                                                            return format(
                                                                message.createdAt.toDate()
                                                            )
                                                        } else if (
                                                            message.createdAt instanceof
                                                            Date
                                                        ) {
                                                            return format(
                                                                message.createdAt
                                                            )
                                                        } else if (
                                                            typeof message.createdAt ===
                                                                'object' &&
                                                            message.createdAt
                                                                .seconds
                                                        ) {
                                                            return format(
                                                                new Date(
                                                                    message
                                                                        .createdAt
                                                                        .seconds *
                                                                        1000
                                                                )
                                                            )
                                                        } else {
                                                            return format(
                                                                new Date(
                                                                    message.createdAt
                                                                )
                                                            )
                                                        }
                                                    } catch (e) {
                                                        console.error(
                                                            'Error formatting date:',
                                                            e
                                                        )
                                                        return 'Just now'
                                                    }
                                                })()}
                                        </div>
                                        <div className="text-[10px] sm:text-xs ml-2">
                                            {isCurrentUser ? '(You)' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <div ref={endRef}></div>
                </div>

                {!showAudioRecorder && (
                    <div className="bottom">
                        {/* Dropdown menu for attachments */}
                        <div className="icons1">
                            <div className="options-menu1" ref={menuRef}>
                                <button
                                    className="more-options-btn"
                                    onClick={toggleDropdown}
                                >
                                    <img src={dots} alt="More options" />
                                </button>
                            </div>
                            {dropdownOpen && (
                                <div className="dropdown-menu" ref={menuRef}>
                                    {/* Image upload option */}
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
                                            accept="image/*"
                                        />
                                    </label>

                                    {/* Camera option */}
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

                                    {/* Document upload option */}
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
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                                onChange={handleDocumentChange}
                                            />
                                        </label>
                                    </div>

                                    {/* Audio send option */}
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

                        {/* Document preview if document is selected */}
                        {documentPreview && (
                            <div className="document-preview flex-1 mr-2">
                                <DocumentPreview
                                    document={documentPreview}
                                    onRemove={() => {
                                        setDocument(null)
                                        setDocumentPreview(null)
                                    }}
                                />
                            </div>
                        )}

                        {/* Message input */}
                        <input
                            className={`${documentPreview ? 'w-full' : 'flex-1'} bg-gray-300 py-5 px-3 rounded-xl`}
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

                        {/* Send button */}
                        {text.trim() === '' && !img.file && !document ? (
                            // Mic button when no text/attachments
                            <img
                                onClick={() => setShowAudioRecorder(true)}
                                src={micIcon}
                                className="send-btn ml-2"
                                alt="Record Audio"
                            />
                        ) : (
                            // Send button when there's content to send
                            <img
                                onClick={() => handleSend()}
                                src={send}
                                className="send-btn ml-2"
                                alt="Send"
                            />
                        )}
                    </div>
                )}

                {/* Audio recorder component */}
                {showAudioRecorder && (
                    <CaptureAudio
                        hide={setShowAudioRecorder}
                        handleSend={handleSend}
                    />
                )}

                {/* Camera modal */}
                {isCameraOpen && (
                    <div className="modal-overlay">
                        <div className="modal" ref={modalRef}>
                            <div className="modal-content">
                                {capturedImage ? (
                                    // Show captured image
                                    <>
                                        <img
                                            src={capturedImage}
                                            alt="Captured"
                                        />
                                        <div className="flex justify-center mt-2 space-x-4">
                                            <button
                                                onClick={() =>
                                                    setIsCameraOpen(false)
                                                }
                                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={redoCapture}
                                                className="px-4 py-2 bg-orange-500 text-white rounded"
                                            >
                                                Retake
                                            </button>
                                            <button
                                                onClick={sendCapturedImage}
                                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // Show camera view
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                        />
                                        <div className="flex justify-center mt-2 space-x-4">
                                            <button
                                                onClick={() =>
                                                    setIsCameraOpen(false)
                                                }
                                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={captureImage}
                                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                            >
                                                Take Photo
                                            </button>
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
