import { useState, useEffect, useRef } from 'react'
import { runTransaction } from 'firebase/firestore'
import {
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc,
    setDoc,
    arrayUnion,
    collection,
    query,
    where
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useUserStore } from '../../utils/userStore'
import { useChatStore } from '../../utils/chatStore'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import upload from '../../utils/upload'
import { format } from 'timeago.js'
import Header from '../../components/Dashboard/Invoices/HeaderProps'
import AddBuyerChat from '../../components/chat/AddBuyerChat'
import { useLocation } from 'react-router-dom';
import DefaultAvatar from '../../components/Dashboard/Invoices/DefaultAvatar'
import defaultimg from "../../assets/chat/default.png"
// Import available icons
import sendIcon from '../../assets/chat/send.png'
import curriculumIcon from '../../assets/chat/curriculum.png'
import paperClip from '../../assets/chat/paperclip.png'
import calendar from '../../assets/chat/calendar.png'
import ImprovedPdfViewer from '../../components/chat/ImprovedPdfViewer'
import DocumentPreview from '../../components/chat/DocumentPreview'
import AppointmentModal from '../../components/chat/AppointmentModal';
import moment from 'moment'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../utils/AuthContext'

import {
    findOrCreateChat,
    fetchUserBasic,
    sendSystemMessage
} from '../../utils/chatHelpers';

const InboxPage = () => {
    // States
    const [chats, setChats] = useState([])
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [img, setImg] = useState({ file: null, url: '' })
    const endRef = useRef(null)
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    // At the top with your other state declarations:
    const [documentFile, setDocumentFile] = useState(null)
    const [documentPreview, setDocumentPreview] = useState(null)
    const [selectedPartner, setSelectedPartner] = useState('');
      
    // Appointment states 
    const [showAppointmentModal, setShowAppointmentModal] = useState(false)
    

    const location = useLocation();

    // Use store hooks
    const { currentUser, fetchUserInfo } = useUserStore()
    const { chatId, user, changeChat, resetChat } = useChatStore()

    // Enhanced responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
    const [isTablet, setIsTablet] = useState(
        window.innerWidth > 640 && window.innerWidth <= 1024
    )
    const [showChatList, setShowChatList] = useState(true)

    // Fetch availability from Firestore (using the correct collection based on role)
    useEffect(() => {
        const { vendorId, context } = location.state || {};
        if (!vendorId) return;                               // opened Inbox normally
      
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;                          // still loading auth?
      
        (async () => {
            const activeChatId = await findOrCreateChat(currentUserId, vendorId);
            const vendorProfile = await fetchUserBasic(vendorId);
            changeChat(activeChatId, vendorProfile);           // updates sidebar + pane
      
            if (context?.productId) {
                await sendSystemMessage(
                    activeChatId,
                    `[Product] Buyer is asking about "${context.productName}"`
                );
            } else if (context?.serviceId) {
                await sendSystemMessage(
                    activeChatId,
                    `[Service] Buyer is asking about "${context.serviceName}"`
                );
            }
        })();
        
        // we only want this to run once when the component mounts with that state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);
    
    // Enhanced responsive handling
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            const mobile = width <= 640
            const tablet = width > 640 && width <= 1024

            setIsMobile(mobile)
            setIsTablet(tablet)

            if (!mobile) {
                // Always show chat list on desktop/tablet
                setShowChatList(true)
            } else {
                // On mobile, only show chat list if no chat is selected
                setShowChatList(!chatId)
            }
        }

        window.addEventListener('resize', handleResize)
        // Call once to set initial state
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [chatId])

    const getCurrentUserId = () => {
        // First try to get from currentUser state
        if (currentUser?.id) {
            return currentUser.id
        }

        // Fall back to localStorage if needed
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const userData = JSON.parse(storedUser)
            return userData.id || userData.uid // Support older format
        }

        return null // No user found
    }

    // Fetch user info on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')

        if (storedUser !== null) {
            const userData = JSON.parse(storedUser)
            fetchUserInfo(userData)
        } else {
            fetchUserInfo()
        }
    }, [fetchUserInfo])

    // Fetch chats for current user
    useEffect(() => {
        const userId = getCurrentUserId()

        if (!userId) {
            return
        }

        // Check and create userchats document if it doesn't exist
        const checkAndCreateUserChats = async () => {
            try {
                const userChatsRef = doc(db, 'userchats', userId)
                const userChatsDoc = await getDoc(userChatsRef)

                if (!userChatsDoc.exists()) {
                    await setDoc(userChatsRef, { chats: [] })
                }
            } catch (err) {
                console.error('Error checking/creating userchats:', err)
            }
        }

        // Ensure the userchats document exists
        checkAndCreateUserChats()

        const unSub = onSnapshot(doc(db, 'userchats', userId), async (res) => {
            if (!res.exists()) {
                setChats([])
                return
            }

            const items = res.data().chats || []

            const promises = items.map(async (item) => {
                try {
                    // Direct lookup by receiverId - now we know this is the document ID
                    console.log(
                        `Fetching user data for receiver ID: ${item.receiverId}`
                    )
                    const userDocRef = doc(db, 'users', item.receiverId)
                    const userDocSnap = await getDoc(userDocRef)

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data()
                        console.log(
                            `Found user data for ${item.receiverId}:`,
                            userData
                        )
                        return {
                            ...item,
                            user: {
                                id: item.receiverId,
                                firstName:
                                    userData.firstName ||
                                    userData.name ||
                                    userData.username ||
                                    'Unknown',
                                lastName: userData.lastName || '',
                                businessName: userData.businessName || '',
                                email: userData.email || '',
                                avatar: userData.avatar || null,
                                role: userData.role || 'user',
                                ...userData,
                            },
                        }
                    }

                    console.warn(
                        `No user document found for ID: ${item.receiverId}, trying query...`
                    )

                    // Try to find user by other means if direct lookup failed
                    const usersRef = collection(db, 'users')
                    const userQuery = query(
                        usersRef,
                        where('uid', '==', item.receiverId)
                    )
                    const querySnapshot = await getDocs(userQuery)

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data()
                        console.log(
                            `Found user via query for ${item.receiverId}:`,
                            userData
                        )
                        return {
                            ...item,
                            user: {
                                id: item.receiverId,
                                firstName:
                                    userData.firstName ||
                                    userData.name ||
                                    userData.username ||
                                    'Unknown',
                                lastName: userData.lastName || '',
                                businessName: userData.businessName || '',
                                email: userData.email || '',
                                avatar: userData.avatar || null,
                                role: userData.role || 'user',
                                ...userData,
                            },
                        }
                    }

                    // Fallback to minimal data if user not found
                    console.warn(
                        `No user data found for ID: ${item.receiverId}, using fallback`
                    )
                    return {
                        ...item,
                        user: {
                            id: item.receiverId,
                            firstName: 'Unknown',
                            lastName: '',
                            businessName: 'User',
                            email: '',
                            avatar: null,
                            role: 'user',
                        },
                    }
                } catch (err) {
                    console.error(
                        `Error fetching user data for ${item.receiverId}:`,
                        err
                    )
                    return {
                        ...item,
                        user: {
                            id: item.receiverId,
                            firstName: 'Unknown',
                            lastName: '',
                            businessName: 'User',
                            email: '',
                            avatar: null,
                            role: 'user',
                        },
                    }
                }
            })

            const chatData = await Promise.all(promises)
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
        })

        return () => unSub()
    }, [currentUser])

    // Fetch messages for current chat
    useEffect(() => {
        if (chatId) {
            const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
                if (res.exists()) {
                    const messagesData = res.data().messages || []
                    setMessages(messagesData)
                } else {
                    setMessages([])
                }
            })

            return () => unSub()
        }
    }, [chatId])

    const fetchAvailabilityForUser = async (userId, role) => {
        const collectionName = role === 'vendor' ? 'Vendors' : 'Buyers';
        const userDocRef = doc(db, collectionName, userId);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                return data.availability || [];
            } else {
                console.warn('No availability found for user in collection', collectionName);
                return [];
            }
        } catch (error) {
            console.error('Error fetching availability for user:', error);
            return [];
        }
    };

    // Scroll to bottom when messages update
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Handle selecting a chat
    const handleSelectChat = async (chat) => {
        try {
            console.log('Selected chat user data:', chat.user)

            if (chat.user) {
                // *** ADD THIS LINE ***
                setSelectedPartner(chat.user.id);
                console.log("Selected partner ID:", chat.user.id);
            }

            // Mark as seen
            const updatedChats = chats.map((c) =>
                c.chatId === chat.chatId ? { ...c, isSeen: true } : c
            )

            const userId = getCurrentUserId()

            if (userId) {
                await updateDoc(doc(db, 'userchats', userId), {
                    chats: updatedChats.map(({ user, ...rest }) => rest),
                })
            }

            // Make sure we have a complete user object with defaults
            const userWithDefaults = {
                ...chat.user,
                firstName:
                    chat.user.firstName ||
                    chat.user.name ||
                    chat.user.username ||
                    'Unknown',
                businessName: chat.user.businessName || 'User',
                role: chat.user.role || 'user',
            }

            // Change active chat
            changeChat(chat.chatId, userWithDefaults)

            // On mobile, hide chat list and show chat
            if (isMobile) {
                setShowChatList(false)
            }
        } catch (error) {
            console.error('Error selecting chat:', error)
        }
    }

    // Handle sending a message
    const handleSend = async () => {
        // Ensure there's something to send: text, image, or document
        if (text.trim() === '' && !img.file && !documentFile) return

        try {
            let imgUrl = null
            let documentUrl = null
            let documentName = null
            let documentType = null

            // Upload image if present
            if (img.file) {
                imgUrl = await upload(img.file)
            }

            // Upload document (PDF, etc.) if present
            if (documentFile) {
                console.log('Uploading document:', documentFile.name)
                documentUrl = await upload(documentFile)
                documentName = documentFile.name
                documentType = documentFile.type
                console.log('Document uploaded successfully:', documentUrl)
            }

            const senderId = getCurrentUserId()
            if (!senderId) {
                alert(
                    'User information not available. Please refresh and try again.'
                )
                return
            }

            const timestamp = new Date()
            // Build the message object including document data if available
            const newMessage = {
                senderId: senderId,
                text: text.trim(),
                createdAt: timestamp,
                ...(imgUrl && { img: imgUrl }),
                ...(documentUrl && {
                    document: documentUrl,
                    documentName,
                    documentType,
                }),
            }

            // Add the new message to the chat document
            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion(newMessage),
            })

            // Update the 'userchats' documents for both the sender and the recipient
            // First, determine the recipient ID
            let recipientId = null
            const senderChatsRef = doc(db, 'userchats', senderId)
            const senderChatsSnapshot = await getDoc(senderChatsRef)
            if (senderChatsSnapshot.exists()) {
                const senderChatsData = senderChatsSnapshot.data()
                const chats = senderChatsData.chats || []
                const currentChat = chats.find((c) => c.chatId === chatId)
                if (currentChat) {
                    recipientId = currentChat.receiverId
                }
            }
            // Fallback to user from chat store if not found
            if (!recipientId) {
                recipientId = user?.id
            }
            if (!recipientId) {
                console.error('No valid recipient ID found')
                return
            }

            const userIDs = [senderId, recipientId]

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
                            // Update the existing chat entry with the latest message details
                            const updatedChats = [...chats]
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: text.trim(),
                                isSeen: id === senderId, // Only the sender marks the message as seen
                                updatedAt: Date.now(),
                            }
                            await updateDoc(userChatsRef, {
                                chats: updatedChats,
                            })
                        } else {
                            // If the chat entry doesn't exist, add a new one
                            const receiverId =
                                id === senderId ? recipientId : senderId
                            const newChatEntry = {
                                chatId: chatId,
                                receiverId: receiverId,
                                lastMessage: text.trim(),
                                isSeen: id === senderId,
                                updatedAt: Date.now(),
                            }
                            await updateDoc(userChatsRef, {
                                chats: arrayUnion(newChatEntry),
                            })
                        }
                    } else {
                        // If the userchats document doesn't exist, create one with the current chat
                        const receiverId =
                            id === senderId ? recipientId : senderId
                        await setDoc(userChatsRef, {
                            chats: [
                                {
                                    chatId: chatId,
                                    receiverId: receiverId,
                                    lastMessage: text.trim(),
                                    isSeen: id === senderId,
                                    updatedAt: Date.now(),
                                },
                            ],
                        })
                    }
                } catch (error) {
                    console.error(`Error updating userchats for ${id}:`, error)
                }
            }

            // Clear input fields and reset file states after sending
            setText('')
            setImg({ file: null, url: '' })
            setDocumentFile(null)
        } catch (err) {
            console.error('Error sending message:', err)
            alert(`Error sending message: ${err.message}`)
        }
    }

    // Handle file upload
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            })
        }
    }

    // File change handler for PDF documents
    const handleDocumentChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            console.log('Document selected:', file.name)
            setDocumentFile(file)
            // Create a preview object (e.g., file name and size)
            setDocumentPreview({
                name: file.name,
                type: file.type,
                size: (file.size / 1024).toFixed(1) + ' KB',
            })
        }
    }

    // Deduplicate chats based on user identity
    const uniqueChats = []
    const seenUserIds = new Set()

    // First pass - use most recently updated chat for each unique user
    chats
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach((chat) => {
            // Get main identifier
            const userId = chat.user?.id

            if (userId && !seenUserIds.has(userId)) {
                // Mark this ID as seen
                seenUserIds.add(userId)
                // Add this chat to unique chats
                uniqueChats.push(chat)
            }
        })

    // Filter unique chats by search query
    const filteredChats = uniqueChats.filter((chat) => {
        const username = chat.user?.username || ''
        const firstName = chat.user?.firstName || ''
        const lastName = chat.user?.lastName || ''
        const businessName = chat.user?.businessName || ''
        const searchableText =
            `${username} ${firstName} ${lastName} ${businessName}`.toLowerCase()
        return searchableText.includes(searchQuery.toLowerCase())
    })

    // Handle new buyer chat selection
    const handleNewBuyerSelect = (chatData) => {
        if (!chatData || !chatData.chatId || !chatData.user) {
            console.error('Invalid chat data')
            return
        }

        try {
            console.log('New buyer selected:', chatData.user)

            // Make sure the user has a name for display
            const userWithDefaults = {
                ...chatData.user,
                firstName:
                    chatData.user.firstName ||
                    chatData.user.name ||
                    chatData.user.username ||
                    'Unknown',
                businessName: chatData.user.businessName || 'User',
                role: chatData.user.role || 'user',
            }

            // Change to the selected chat with enhanced user data
            changeChat(chatData.chatId, userWithDefaults)

            if (isMobile) {
                setShowChatList(false)
            }
        } catch (error) {
            console.error('Error changing chat:', error)
        }
    }
    
    const combineDateAndTime = (date, timeString) => {
        // Set the date to start of day (local)
        const dateMoment = moment(date).startOf('day')
        // Parse the time string (assumed to be in 'h:mm A' format)
        const timeMoment = moment(timeString, 'h:mm A')
        // Merge hours and minutes from the time into the date
        dateMoment.hours(timeMoment.hours())
        dateMoment.minutes(timeMoment.minutes())
        return dateMoment.toDate()
    }

    const { user: authUser } = useAuth();
    // Updated saveAppointment using selectedDate directly
    const saveAppointment = async (appointmentData) => {
        console.log("Saving appointment with data:", appointmentData)
        try {
            const isBuyer = authUser?.role === 'buyer';
            const buyerId = isBuyer ? authUser?.uid : selectedPartner;
            const vendorId = isBuyer ? selectedPartner : authUser?.uid;

            console.log('buyerid',buyerId)
            console.log('vendorid',vendorId)
    
            if (!buyerId || !vendorId) {
                alert("Missing buyer or vendor information.")
                return
            }
      
            // Combine selectedDate and selectedTime into a single Date object
            const combinedDateTime = combineDateAndTime(
                appointmentData.selectedDate,
                appointmentData.selectedTime
            )
      
            const appointmentId = new Date().getTime().toString()
      
            // Create the data to store, using the combined date/time.
            const safeData = {
                ...appointmentData,
                buyerId,
                vendorId,
                createdAt: new Date(),
                // Save the combined Date (Firestore will store it as a Timestamp)
                selectedDate: combinedDateTime,
            }
      
            // Run a transaction to check for conflicts and create the appointment atomically.
            await runTransaction(db, async (transaction) => {
                // Build a query to check for any existing appointment for this vendor on the same day.
                const startOfDay = moment(combinedDateTime).startOf('day').toDate()
                const endOfDay = moment(combinedDateTime).endOf('day').toDate()
                const appointmentsRef = collection(db, "appointments")
                const q = query(
                    appointmentsRef,
                    where("vendorId", "==", vendorId),
                    where("selectedDate", ">=", startOfDay),
                    where("selectedDate", "<=", endOfDay)
                )
                const querySnapshot = await getDocs(q)
        
                // Check if any appointment exists with the same selectedTime.
                let conflict = false
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data()
                    // For a strict equality check on the time string.
                    if (data.selectedTime === appointmentData.selectedTime) {
                        conflict = true
                    }
                })
        
                if (conflict) {
                    throw new Error("This time slot is already booked.")
                }
        
                // If no conflict, create the appointment document.
                const appointmentDocRef = doc(db, "appointments", appointmentId)
                transaction.set(appointmentDocRef, safeData)
            })
      
            // Optionally update the chat with a notification message.
            if (chatId) {
                const notificationMessage = {
                    senderId: "system",
                    text: `Appointment scheduled for ${moment(combinedDateTime).format("ddd, MMM Do, h:mm A")}`,
                    createdAt: new Date(),
                    isNotification: true,
                }
                await updateDoc(doc(db, "chats", chatId), {
                    messages: arrayUnion(notificationMessage),
                })
            }
      
            toast.success("Appointment scheduled successfully!")
        } catch (error) {
            console.error("Error scheduling appointment:", error)
            toast.error(error.message || "Failed to schedule appointment.")
        }
    }
      
    // Handler to open appointment modal
    const handleOpenAppointmentModal = () => {
        setShowAppointmentModal(true)
    }

    // Handler for appointment modal save
    const handleSaveAppointment = (appointmentData) => {
        console.log("Received appointment data in parent:", appointmentData);
        saveAppointment(appointmentData);
        setShowAppointmentModal(false);
    }

    return (
        <BaseLayout>
            <div className="flex flex-col h-screen">
                {/* Header - Responsive */}
                <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
                    <div className="flex items-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-nunito">
                            Inbox
                        </h1>
                    </div>
                </div>

                {/* Main Chat Container - Responsive */}
                <div className={`flex flex-1 ${isMobile ? 'mx-2' : 'mx-3 sm:mx-4 md:mx-6'} ${!isMobile ? 'mb-2 sm:mb-4 md:mb-6 rounded-2xl border-2 border-[#5F4B8B] overflow-hidden shadow-lg' : ''} bg-white`}>
                    {/* Chat List - Left Sidebar */}
                    {(showChatList || !isMobile) && (
                        <div
                            className={`${
                                isMobile 
                                    ? 'w-full bg-[#9082C6] rounded-tr-2xl sm:rounded-tr-3xl' 
                                    : isTablet 
                                        ? 'w-2/5' 
                                        : 'w-1/3'
                            } ${!isMobile ? 'border-r-2 border-[#5F4B8B]' : ''} flex flex-col ${
                                isMobile ? 'p-3 sm:p-4' : 'p-4'
                            } ${!isMobile ? 'rounded-tl-3xl' : 'rounded-tl-2xl sm:rounded-tl-3xl'}`}
                            style={{
                                minWidth: isMobile
                                    ? '100%'
                                    : isTablet
                                        ? '40%'
                                        : '280px',
                                maxWidth: isMobile
                                    ? '100%'
                                    : isTablet
                                        ? '40%'
                                        : '33.333%',
                                overflow: 'hidden',
                            }}
                        >
                            <div className="bg-white rounded-xl sm:rounded-2xl flex-1 overflow-hidden">
                                {/* Search and New Chat Button */}
                                <div className="p-3 sm:p-4 border-b border-gray-200">
                                    <div className="relative mb-2 sm:mb-3">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base rounded-full border border-[#5F4B8B] focus:outline-none focus:ring-2 focus:ring-purple-300"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowNewChatModal(true)
                                        }
                                        className="w-full py-2 sm:py-2.5 mt-2 rounded-full bg-buttonBg text-white text-sm sm:text-base flex items-center justify-center hover:bg-[#4A3B7A] transition-colors"
                                    >
                                        <span className="mr-2">+</span>
                                        <span className="hidden xs:inline">
                                            {currentUser?.role === 'vendor'
                                                ? 'Chat with Buyer'
                                                : 'Chat with Vendor'}
                                        </span>
                                        <span className="xs:hidden">
                                            New Chat
                                        </span>
                                    </button>
                                </div>

                                {/* Chat List */}
                                <div
                                    className="border-t-2 border-[#5F4B8B] overflow-y-auto flex-1"
                                    style={{ maxWidth: '100%' }}
                                >
                                    {filteredChats.length > 0 ? (
                                        filteredChats.map((chat) => (
                                            <div
                                                key={chat.chatId}
                                                className={`flex items-center p-3 sm:p-4 md:p-5 lg:p-6 border-b-2 border-[#5F4B8B] cursor-pointer hover:bg-gray-50 transition-colors ${
                                                    chatId === chat.chatId
                                                        ? 'bg-[#F4F1FA]'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleSelectChat(chat)
                                                }
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <DefaultAvatar     
                                                    user={chat.user}     
                                                    size={isMobile ? "sm" : "md"}
                                                    className="flex-shrink-0 mr-2 sm:mr-3"     
                                                    defaultImage={defaultimg} 
                                                />
                                                <div
                                                    className="overflow-hidden flex-1 min-w-0"
                                                    style={{
                                                        width: 'calc(100% - 55px)',
                                                        maxWidth: 'calc(100% - 55px)',
                                                        flexShrink: 1,
                                                    }}
                                                >
                                                    <h4
                                                        className="font-semibold truncate text-sm sm:text-base"
                                                        style={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            display: 'block',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        {chat.user?.firstName ||
                                                            chat.user?.name ||
                                                            chat.user?.username ||
                                                            chat.user?.businessName ||
                                                            `User ${chat.receiverId?.substring(0, 6) || ''}`}
                                                    </h4>
                                                    <p
                                                        className="text-xs sm:text-sm text-gray-500 truncate"
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '100%',
                                                        }}
                                                    >
                                                        {chat.lastMessage
                                                            ? chat.lastMessage.length > (isMobile ? 20 : 30)
                                                                ? chat.lastMessage.substring(0, isMobile ? 20 : 30) + '...'
                                                                : chat.lastMessage
                                                            : 'No messages yet'}
                                                    </p>
                                                </div>
                                                {!chat.isSeen && (
                                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full ml-1 sm:ml-2 flex-shrink-0"></div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                                            No conversations found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Area - Right Side */}
                    {(!showChatList || !isMobile || (isMobile && chatId)) && (
                        <div className="flex-1 flex flex-col min-w-0">
                            {chatId ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="bg-[#5F4B8B] text-white p-3 sm:p-4 md:p-5 flex items-center flex-shrink-0">
                                        {isMobile && (
                                            <button
                                                className="mr-2 sm:mr-3 text-white font-bold text-lg hover:bg-white/20 rounded px-2 py-1 transition-colors"
                                                onClick={() => setShowChatList(true)}
                                            >
                                                ←
                                            </button>
                                        )}
                                        <img
                                            src={user?.avatar || './avatar.png'}
                                            alt=""
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full object-cover mr-2 sm:mr-3 flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl truncate">
                                                {user?.firstName ||
                                                    user?.name ||
                                                    user?.username ||
                                                    user?.businessName ||
                                                    'Unknown User'}
                                            </h3>
                                            <p className="text-xs sm:text-sm opacity-80">
                                                {user?.role || 'User'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 min-h-0">
                                        {messages.length > 0 ? (
                                            messages.map((message, index) => {
                                                const currentUserId = getCurrentUserId()
                                                const isCurrentUser = message.senderId === currentUserId
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex mb-3 sm:mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        {!isCurrentUser && (
                                                            <img
                                                                src={user?.avatar || './avatar.png'}
                                                                alt=""
                                                                className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3 self-start mt-1"
                                                            />
                                                        )}
                                                        <div
                                                            className={`w-auto max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 sm:py-3 ${
                                                                isCurrentUser 
                                                                    ? 'bg-[#5F4B8BB0] text-white rounded-[20px] rounded-br-none' 
                                                                    : 'bg-[#AFAFAF9C] text-gray-800 rounded-[20px] rounded-bl-none'
                                                            } overflow-hidden`}
                                                            style={{
                                                                wordBreak: 'break-word',
                                                                overflowWrap: 'break-word',
                                                            }}
                                                        >
                                                            {message.document && (
                                                                <ImprovedPdfViewer
                                                                    pdfUrl={message.document}
                                                                    filename={message.documentName}
                                                                    isCurrentUser={isCurrentUser}
                                                                />
                                                            )}

                                                            {message.img && (
                                                                <img
                                                                    src={message.img}
                                                                    alt="Attachment"
                                                                    className="rounded mb-2 max-w-full h-auto object-contain"
                                                                    style={{
                                                                        maxHeight: isMobile ? '150px' : '200px',
                                                                    }}
                                                                />
                                                            )}

                                                            {message.text && (
                                                                <p className="text-sm sm:text-base overflow-hidden">
                                                                    {message.text}
                                                                </p>
                                                            )}

                                                            <div className="flex justify-between items-center mt-1">
                                                                <div
                                                                    className={`text-xs ${isCurrentUser ? 'text-purple-200' : 'text-gray-500'}`}
                                                                >
                                                                    {message.createdAt &&
                                                                        (() => {
                                                                            try {
                                                                                if (typeof message.createdAt.toDate === 'function') {
                                                                                    return format(message.createdAt.toDate())
                                                                                } else if (message.createdAt instanceof Date) {
                                                                                    return format(message.createdAt)
                                                                                } else if (typeof message.createdAt === 'object' && message.createdAt.seconds) {
                                                                                    return format(new Date(message.createdAt.seconds * 1000))
                                                                                } else {
                                                                                    return format(new Date(message.createdAt))
                                                                                }
                                                                            } catch (e) {
                                                                                console.error('Error formatting date:', e)
                                                                                return 'Just now'
                                                                            }
                                                                        })()}
                                                                </div>
                                                                <div className="text-xs ml-2">
                                                                    {isCurrentUser ? '(You)' : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                                                No messages yet. Start the conversation!
                                            </div>
                                        )}
                                        <div ref={endRef} />
                                    </div>

                                    {/* Message Input Area */}
                                    <div className="border-t border-gray-200 p-2 sm:p-3 bg-white flex-shrink-0">
                                        {/* File Previews */}
                                        {img.url && (
                                            <div className="mb-2 relative inline-block">
                                                <img
                                                    src={img.url}
                                                    alt="Preview"
                                                    className="max-h-12 sm:max-h-16 md:max-h-20 rounded"
                                                />
                                                <button
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs"
                                                    onClick={() => setImg({ file: null, url: '' })}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}

                                        {documentPreview && (
                                            <div className="mb-2 relative inline-block">
                                                <DocumentPreview
                                                    document={documentPreview}
                                                    onRemove={() => {
                                                        setDocumentFile(null)
                                                        setDocumentPreview(null)
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Input Area */}
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            {/* Action Buttons */}
                                            <div className="flex gap-1 sm:gap-2">
                                                <label className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                    <img
                                                        src={curriculumIcon}
                                                        alt="Image"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />
                                                </label>

                                                <label className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                    <img
                                                        src={paperClip}
                                                        alt="Document"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleDocumentChange}
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                    />
                                                </label>

                                                <button 
                                                    onClick={handleOpenAppointmentModal} 
                                                    className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <img
                                                        src={calendar}
                                                        alt="Schedule"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                </button>
                                            </div>

                                            {/* Text Input */}
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 py-2 px-3 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 min-w-0"
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSend()
                                                    }
                                                }}
                                            />

                                            {/* Send Button */}
                                            <button
                                                className={`flex-shrink-0 ${
                                                    text.trim() === '' && !img.file && !documentFile
                                                        ? 'bg-gray-400' 
                                                        : 'bg-[#5F4B8B] hover:bg-[#4A3B7A]'
                                                } text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-colors`}
                                                onClick={handleSend}
                                                disabled={text.trim() === '' && !img.file && !documentFile}
                                            >
                                                <img
                                                    src={sendIcon}
                                                    alt="Send"
                                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* No Chat Selected */
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center p-4 sm:p-6">
                                        <div className="text-gray-400 text-base sm:text-lg mb-3 sm:mb-4">
                                            Select a chat to start messaging
                                        </div>
                                        {isMobile && !showChatList && (
                                            <button
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm sm:text-base hover:bg-purple-600 transition-colors"
                                                onClick={() => setShowChatList(true)}
                                            >
                                                See Conversations
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer 
                position={isMobile ? "top-center" : "bottom-right"}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className={isMobile ? "mt-16" : ""}
            />

            {/* Appointment Modal */}
            {showAppointmentModal && (
                <AppointmentModal
                    onClose={() => setShowAppointmentModal(false)}
                    onSchedule={handleSaveAppointment}
                    selectedPartner={selectedPartner}
                />
            )}

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
                        <AddBuyerChat
                            onClose={() => setShowNewChatModal(false)}
                            onBuyerSelect={handleNewBuyerSelect}
                            userRole={currentUser?.role}
                            searchRole={currentUser?.role === 'vendor' ? 'buyer' : 'vendor'}
                        />
                    </div>
                </div>
            )}
        </BaseLayout>
    )
}

export default InboxPage