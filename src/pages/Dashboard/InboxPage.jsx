import { useState, useEffect, useRef } from 'react'
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

// Import available icons
import sendIcon from '../../assets/chat/send.png'
import curriculumIcon from '../../assets/chat/curriculum.png'
import paperClip from '../../assets/chat/paperclip.png'
import calendar from '../../assets/chat/calendar.png'

const InboxPage = () => {
    // States
    const [chats, setChats] = useState([])
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [img, setImg] = useState({ file: null, url: '' })
    const endRef = useRef(null)
    const [showNewChatModal, setShowNewChatModal] = useState(false)

    // Use store hooks
    const { currentUser, fetchUserInfo } = useUserStore()
    const { chatId, user, changeChat, resetChat } = useChatStore()

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024)
    const [showChatList, setShowChatList] = useState(true)

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width <= 768;
            const tablet = width > 768 && width <= 1024;
            
            setIsMobile(mobile);
            setIsTablet(tablet);
            
            if (!mobile) {
                // Always show chat list on desktop/tablet
                setShowChatList(true);
            } else {
                // On mobile, only show chat list if no chat is selected
                setShowChatList(!chatId);
            }
        };

        window.addEventListener('resize', handleResize);
        // Call once to set initial state
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [chatId]);

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
        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const userId = currentUser?.docId || currentUser?.uid || storedUser?.uid;
        
        if (!userId) {
            return;
        }
        
        // Check and create userchats document if it doesn't exist
        const checkAndCreateUserChats = async () => {
            try {
                const userChatsRef = doc(db, 'userchats', userId);
                const userChatsDoc = await getDoc(userChatsRef);
                
                if (!userChatsDoc.exists()) {
                    await setDoc(userChatsRef, { chats: [] });
                }
            } catch (err) {
                console.error("Error checking/creating userchats:", err);
            }
        };
        
        // Ensure the userchats document exists
        checkAndCreateUserChats();
        
        const unSub = onSnapshot(
            doc(db, 'userchats', userId),
            async (res) => {
                if (!res.exists()) {
                    setChats([]);
                    return;
                }

                const items = res.data().chats || [];
                
                const promises = items.map(async (item) => {
                    try {
                        // Try multiple approaches to find the user
                        let userData = null;
                        let userDocId = null;
                        
                        // 1. First try direct lookup by receiverId
                        const userDocRef = doc(db, 'users', item.receiverId);
                        const userDocSnap = await getDoc(userDocRef);

                        if (userDocSnap.exists()) {
                            // Found user directly
                            userData = userDocSnap.data();
                            userDocId = userDocSnap.id;
                        } else {
                            // 2. Try to find by uid field
                            const usersRef = collection(db, 'users');
                            const q = query(usersRef, where('uid', '==', item.receiverId));
                            const querySnapshot = await getDocs(q);
                            
                            if (!querySnapshot.empty) {
                                userData = querySnapshot.docs[0].data();
                                userDocId = querySnapshot.docs[0].id;
                            } else {
                                // 3. Try to find by docId field if it exists
                                const docIdQuery = query(usersRef, where('docId', '==', item.receiverId));
                                const docIdSnapshot = await getDocs(docIdQuery);
                                
                                if (!docIdSnapshot.empty) {
                                    userData = docIdSnapshot.docs[0].data();
                                    userDocId = docIdSnapshot.docs[0].id;
                                } else {
                                    // Last attempt - look for any unique identifier
                                    const idQuery = query(usersRef, where('id', '==', item.receiverId));
                                    const idSnapshot = await getDocs(idQuery);
                                    
                                    if (!idSnapshot.empty) {
                                        userData = idSnapshot.docs[0].data();
                                        userDocId = idSnapshot.docs[0].id;
                                    }
                                }
                            }
                        }
                        
                        // If we found user data, return it
                        if (userData) {
                            return { 
                                ...item, 
                                user: {
                                    id: item.receiverId,
                                    docId: userDocId,
                                    ...userData 
                                }
                            };
                        }
                        
                        // Fallback to minimal data
                        return { ...item, user: { id: item.receiverId } };
                    } catch (err) {
                        console.error('Error fetching user data:', err);
                        return item;
                    }
                });

                const chatData = await Promise.all(promises);
                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            }
        );

        return () => unSub();
    }, [currentUser]);

    // Fetch messages for current chat
    useEffect(() => {
        if (chatId) {
            const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
                if (res.exists()) {
                    const messagesData = res.data().messages || [];
                    setMessages(messagesData);
                } else {
                    setMessages([]);
                }
            });
            
            return () => unSub();
        }
    }, [chatId]);

    // Scroll to bottom when messages update
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages]);

    // Handle selecting a chat
    const handleSelectChat = async (chat) => {
        try {
            // Mark as seen
            const updatedChats = chats.map((c) =>
                c.chatId === chat.chatId ? { ...c, isSeen: true } : c
            );

            const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const userId = currentUser?.docId || currentUser?.uid || storedUser?.uid;
            
            if (userId) {
                await updateDoc(doc(db, 'userchats', userId), {
                    chats: updatedChats.map(({ user, ...rest }) => rest),
                });
            }

            // Change active chat
            changeChat(chat.chatId, chat.user);

            // On mobile, hide chat list and show chat
            if (isMobile) {
                setShowChatList(false);
            }
        } catch (error) {
            console.error('Error selecting chat:', error);
        }
    };

    // Handle sending a message
    const handleSend = async () => {
        if (text.trim() === '' && !img.file) return;
      
        try {
            let imgUrl = null;
            if (img.file) {
                imgUrl = await upload(img.file);
            }
          
            // Determine sender ID consistently
            const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const senderId = currentUser?.docId || currentUser?.uid || storedUser?.uid;
          
            // Make sure we have a valid sender ID
            if (!senderId) {
                alert("User information not available. Please refresh and try again.");
                return;
            }
          
            // Add message to chat document
            const timestamp = new Date();
            const newMessage = {
                senderId: senderId,
                text: text.trim(),
                createdAt: timestamp,
                ...(imgUrl && { img: imgUrl }),
            };
            
            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion(newMessage),
            });
          
            // Find the correct recipient ID
            const userChatsRef = doc(db, 'userchats', senderId);
            const userChatsSnapshot = await getDoc(userChatsRef);
            let recipientId = null;
            
            if (userChatsSnapshot.exists()) {
                const userChatsData = userChatsSnapshot.data();
                const chats = userChatsData.chats || [];
                const currentChat = chats.find(c => c.chatId === chatId);
                
                if (currentChat) {
                    recipientId = currentChat.receiverId;
                }
            }
            
            // Fallback to user object if we couldn't find the recipient ID
            if (!recipientId) {
                recipientId = user?.docId || user?.id || user?.uid;
            }
            
            if (!recipientId) {
                console.error("No valid recipient ID found");
                return;
            }
            
            const userIDs = [senderId, recipientId];
          
            // Update both the sender and the recipient userchats documents
            for (const id of userIDs) {
                try {
                    const userChatsRef = doc(db, 'userchats', id);
                    const userChatsSnapshot = await getDoc(userChatsRef);
                    
                    if (userChatsSnapshot.exists()) {
                        const userChatsData = userChatsSnapshot.data();
                        const chats = userChatsData.chats || [];
                        
                        // Find the chat that needs updating
                        const chatIndex = chats.findIndex(c => c.chatId === chatId);
                        
                        if (chatIndex !== -1) {
                            // Create a new array to ensure the update triggers correctly
                            const updatedChats = [...chats];
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: text.trim(),
                                isSeen: id === senderId, // Only sender has seen the latest message
                                updatedAt: Date.now()
                            };
                            
                            await updateDoc(userChatsRef, { chats: updatedChats });
                        } else {
                            // Determine the receiver ID for this user's chat entry
                            const receiverId = id === senderId ? recipientId : senderId;
                            
                            // Add the chat to the user's chats if it doesn't exist
                            const newChatEntry = {
                                chatId: chatId,
                                receiverId: receiverId,
                                lastMessage: text.trim(),
                                isSeen: id === senderId,
                                updatedAt: Date.now()
                            };
                            
                            await updateDoc(userChatsRef, {
                                chats: arrayUnion(newChatEntry)
                            });
                        }
                    } else {
                        // Determine the receiver ID for this user's chat entry
                        const receiverId = id === senderId ? recipientId : senderId;
                        
                        // Create a new userchats document with this chat
                        await setDoc(userChatsRef, {
                            chats: [{
                                chatId: chatId,
                                receiverId: receiverId,
                                lastMessage: text.trim(),
                                isSeen: id === senderId,
                                updatedAt: Date.now()
                            }]
                        });
                    }
                } catch (error) {
                    console.error(`Error updating userchats for ${id}:`, error);
                }
            }
          
            // Clear the input field and image preview
            setText('');
            setImg({ file: null, url: '' });
        } catch (err) {
            console.error('Error sending message:', err);
            alert(`Error sending message: ${err.message}`);
        }
    };

    // Handle file upload
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    // Handle file document upload
    const handleDocumentChange = (e) => {
        if (e.target.files[0]) {
            // Here you would handle document uploads
            console.log('Document selected:', e.target.files[0].name);
            // Add your document upload logic here
        }
    };

    // Deduplicate chats based on user identity
    const uniqueChats = [];
    const seenUserIds = new Set();
    
    // First pass - use most recently updated chat for each unique user
    chats.sort((a, b) => b.updatedAt - a.updatedAt).forEach(chat => {
        // Get all possible identifiers for this user
        const userId = chat.user?.id;
        const userDocId = chat.user?.docId;
        const userUid = chat.user?.uid;
        const username = chat.user?.username;
        
        // Create a unique identifier based on available fields
        const identifiers = [userId, userDocId, userUid, username].filter(Boolean);
        
        // Check if we've already seen this user
        const alreadySeen = identifiers.some(id => seenUserIds.has(id));
        
        if (!alreadySeen && identifiers.length > 0) {
            // Mark all identifiers as seen
            identifiers.forEach(id => seenUserIds.add(id));
            // Add this chat to unique chats
            uniqueChats.push(chat);
        }
    });
    
    // Filter unique chats by search query
    const filteredChats = uniqueChats.filter((chat) => {
        const username = chat.user?.username || '';
        const firstName = chat.user?.firstName || '';
        const lastName = chat.user?.lastName || '';
        const businessName = chat.user?.businessName || '';
        const searchableText = `${username} ${firstName} ${lastName} ${businessName}`.toLowerCase();
        return searchableText.includes(searchQuery.toLowerCase());
    });

    // Handle new buyer chat selection
    const handleNewBuyerSelect = (chatData) => {
        if (!chatData || !chatData.chatId || !chatData.user) {
            console.error("Invalid chat data");
            return;
        }
        
        try {
            // Change to the selected chat
            changeChat(chatData.chatId, chatData.user);
            
            if (isMobile) {
                setShowChatList(false);
            }
        } catch (error) {
            console.error("Error changing chat:", error);
        }
    };

    return (
        <BaseLayout>
            <div className="flex flex-col h-screen">
                <div className="flex justify-between items-center px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                    <div className="flex items-center">
                        <h1 className="text-[32px] sm:text-[45px] md:text-[60px] font-nunito font-bold">Inbox</h1>
                    </div>
                    <div>
                        <Header />
                    </div>
                </div>

                <div className="flex flex-1 mx-2 sm:mx-4 md:mx-6 mb-2 sm:mb-4 md:mb-6 rounded-2xl border-2 border-[#5F4B8B] overflow-hidden shadow-lg bg-white">

                    {/* Chat List - Left Sidebar */}
                    {/* Ensure chat list is always visible regardless of user role */}
                    {(showChatList || !isMobile) && (
                        <div className={`${isMobile ? 'w-full' : isTablet ? 'w-2/5' : 'w-1/3'} border-r-2 border-[#5F4B8B] flex flex-col`} 
                        style={{ 
                            minWidth: isMobile ? "100%" : isTablet ? "40%" : "250px",
                            maxWidth: isMobile ? "100%" : isTablet ? "40%" : "33.333%",
                            overflow: "hidden"
                        }}>
                    
                            <div className="p-3 sm:p-4 border-b border-gray-200">
                                <div className="relative mb-2">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full py-2 px-4 rounded-[3.75rem] border border-[#5F4B8B] focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                
                                {/* Show appropriate button based on user role */}
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    className="w-full py-2 mt-2 rounded-lg bg-[#5F4B8B] text-white flex items-center justify-center hover:bg-[#4A3B7A] transition-colors"
                                >
                                    <span className="mr-2">+</span>
                                    {currentUser?.role === 'vendor' 
                                        ? 'Chat with Buyer' 
                                        : 'Chat with Vendor'}
                                </button>
                            </div>

                            <div className="border-t-2 border-[#5F4B8B] overflow-y-auto flex-1" style={{ maxWidth: "100%" }}>
                                {filteredChats.length > 0 ? (
                                    filteredChats.map((chat) => (
                                        <div
                                            key={chat.chatId}
                                            className={`flex items-center p-3 sm:p-4 md:p-6 border-b-2 border-[#5F4B8B] cursor-pointer hover:bg-gray-50 ${
                                                chatId === chat.chatId
                                                    ? 'bg-[#F4F1FA]'
                                                    : ''
                                            }`}
                                            onClick={() => handleSelectChat(chat)}
                                            style={{ 
                                                width: '100%', 
                                                maxWidth: '100%',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <img
                                                src={
                                                    chat.user?.avatar ||
                                                    './avatar.png'
                                                }
                                                alt=""
                                                className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-2 sm:mr-3"
                                            />
                                            <div className="overflow-hidden" style={{ 
                                                width: 'calc(100% - 55px)',
                                                maxWidth: 'calc(100% - 55px)',
                                                flexShrink: 1
                                            }}>
                                                <h4 className="font-semibold truncate text-sm sm:text-base" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                    width: '100%'
                                                }}>
                                                    {chat.user?.firstName || 
                                                     chat.user?.username || 
                                                     chat.user?.businessName || 
                                                     'Unknown User'}
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
                                                        ? chat.lastMessage.length > 30 
                                                            ? chat.lastMessage.substring(0, 30) + '...' 
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
                                    <div className="p-4 text-center text-gray-500">
                                        No conversations found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Area - Right Side */}
                    {(!showChatList || !isMobile || (isMobile && chatId)) && (
                        <div className="flex-1 flex flex-col">
                            {chatId ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="bg-[#5F4B8B] text-white p-3 sm:p-4 md:p-5 flex items-center">
                                        {isMobile && (
                                            <button
                                                className="mr-2 sm:mr-3 text-white font-bold"
                                                onClick={() =>
                                                    setShowChatList(true)
                                                }
                                            >
                                                ←
                                            </button>
                                        )}
                                        <img
                                            src={user?.avatar || './avatar.png'}
                                            alt=""
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-cover mr-2 sm:mr-3"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-xl md:text-[25px]">
                                                {user?.firstName || 
                                                 user?.username || 
                                                 user?.businessName || 
                                                 'Unknown User'}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs">
                                                {user?.role || 'User'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50">
                                        {messages.length > 0 ? (
                                            messages.map((message, index) => {
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
                                            })
                                        ) : (
                                            <div className="text-center py-6 sm:py-8 text-gray-500">
                                                No messages yet. Start the conversation!
                                            </div>
                                        )}
                                        <div ref={endRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="border-t border-gray-200 p-2 sm:p-3 bg-white">
                                        {img.url && (
                                            <div className="mb-2 relative inline-block">
                                                <img
                                                    src={img.url}
                                                    alt="Preview"
                                                    className="max-h-16 sm:max-h-20 rounded"
                                                />
                                                <button
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                                                    onClick={() =>
                                                        setImg({
                                                            file: null,
                                                            url: '',
                                                        })
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <div className="flex space-x-2 sm:space-x-3 mr-2 sm:mr-3">
                                                {/* Curriculum/Resume Icon */}
                                                <label className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-full">
                                                    <img
                                                        src={curriculumIcon}
                                                        alt="Resume"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />
                                                </label>

                                                {/* Paper Clip Icon */}
                                                <label className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-full">
                                                    <img
                                                        src={paperClip}
                                                        alt="Attach"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={
                                                            handleDocumentChange
                                                        }
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                    />
                                                </label>

                                                {/* Calendar Icon */}
                                                <button className="p-1 sm:p-2 hover:bg-gray-100 rounded-full">
                                                    <img
                                                        src={calendar}
                                                        alt="Schedule"
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                    />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 py-2 px-3 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                                                value={text}
                                                onChange={(e) =>
                                                    setText(e.target.value)
                                                }
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSend()
                                                    }
                                                }}
                                            />

                                            <button
                                                className={`ml-2 sm:ml-3 ${text.trim() === '' && !img.file ? 'bg-gray-400' : 'bg-[#5F4B8B]'} text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center`}
                                                onClick={handleSend}
                                                disabled={
                                                    text.trim() === '' && !img.file
                                                }
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
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center p-4 sm:p-6">
                                        <div className="text-gray-400 text-base sm:text-lg mb-2">
                                            Select a chat to start messaging
                                        </div>
                                        {isMobile && !showChatList && (
                                            <button
                                                className="px-3 py-1 sm:px-4 sm:py-2 bg-purple-500 text-white rounded-lg"
                                                onClick={() =>
                                                    setShowChatList(true)
                                                }
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

            {/* Modal for selecting a chat partner based on user role */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <AddBuyerChat 
                        onClose={() => setShowNewChatModal(false)}
                        onBuyerSelect={handleNewBuyerSelect}
                        userRole={currentUser?.role}
                        searchRole={currentUser?.role === 'vendor' ? 'buyer' : 'vendor'}
                    />
                </div>
            )}
        </BaseLayout>
    )
}

export default InboxPage