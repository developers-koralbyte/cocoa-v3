// AddBuyerChat.jsx - Simplified ID handling
import { useState, useEffect } from 'react'
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useUserStore } from '../../utils/userStore'
import DefaultAvatar from "../Dashboard/Invoices/DefaultAvatar"
const AddBuyerChat = ({ onClose, onBuyerSelect, userRole, searchRole }) => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { currentUser } = useUserStore()

    // Determine which role to search for
    const roleToSearch =
        searchRole || (userRole === 'vendor' ? 'buyer' : 'vendor')

    // Fetch users with the appropriate role
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError(null)

                const usersRef = collection(db, 'users')
                const q = query(usersRef, where('role', '==', roleToSearch))
                const querySnapshot = await getDocs(q)

                const usersList = querySnapshot.docs.map((docSnap) => ({
                    id: docSnap.id, // Use the document ID as the primary identifier
                    ...docSnap.data(),
                }))

                setUsers(usersList)
                setFilteredUsers(usersList)
            } catch (err) {
                console.error(`Error fetching ${roleToSearch}s:`, err)
                setError(`Failed to load users: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [roleToSearch])

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users)
            return
        }

        const lower = searchTerm.toLowerCase()
        const filtered = users.filter((u) => {
            const business = (u.businessName || '').toLowerCase()
            const first = (u.firstName || '').toLowerCase()
            const last = (u.lastName || '').toLowerCase()
            const full = `${first} ${last}`
            const username = (u.username || '').toLowerCase()
            return (
                business.includes(lower) ||
                full.includes(lower) ||
                username.includes(lower)
            )
        })

        setFilteredUsers(filtered)
    }, [searchTerm, users])

    // Helper to get current user ID
    const getCurrentUserId = () => {
        if (currentUser?.id) return currentUser.id
        const stored = localStorage.getItem('user')
        if (stored) {
            const data = JSON.parse(stored)
            return data.id || data.uid
        }
        return null
    }

    // Create or reuse chat
    const handleUserSelect = async (selectedUser) => {
        try {
            setError(null)

            const currentUserId = getCurrentUserId()
            if (!currentUserId) {
                setError('User info missing. Please refresh and log in again.')
                return
            }

            if (!selectedUser?.id) {
                setError('Invalid user information.')
                return
            }

            const selectedUserId = selectedUser.id
            if (currentUserId === selectedUserId) {
                setError('You cannot chat with yourself.')
                return
            }

            // check existing chat for current user
            const userChatsRef = doc(db, 'userchats', currentUserId)
            const userChatsSnap = await getDoc(userChatsRef)
            if (userChatsSnap.exists()) {
                const chats = userChatsSnap.data().chats || []
                const existing = chats.find(
                    (c) => c.receiverId === selectedUserId
                )
                if (existing) {
                    onBuyerSelect({
                        chatId: existing.chatId,
                        user: selectedUser,
                    })
                    onClose()
                    return
                }
            }

            // create new chat
            const chatRef = doc(collection(db, 'chats'))
            const chatId = chatRef.id
            await setDoc(chatRef, {
                createdAt: serverTimestamp(),
                messages: [],
                participants: [currentUserId, selectedUserId],
            })

            const timestamp = Date.now()

            const currentUserChatData = {
                chatId,
                receiverId: selectedUserId,
                lastMessage: '',
                updatedAt: timestamp,
                isSeen: true,
            }

            if (userChatsSnap.exists()) {
                const existing = userChatsSnap.data().chats || []
                await updateDoc(userChatsRef, {
                    chats: [...existing, currentUserChatData],
                })
            } else {
                await setDoc(userChatsRef, { chats: [currentUserChatData] })
            }

            const receiverChatsRef = doc(db, 'userchats', selectedUserId)
            const receiverChatsSnap = await getDoc(receiverChatsRef)
            const receiverChatData = {
                chatId,
                receiverId: currentUserId,
                lastMessage: '',
                updatedAt: timestamp,
                isSeen: false,
            }

            if (receiverChatsSnap.exists()) {
                const rc = receiverChatsSnap.data().chats || []
                await updateDoc(receiverChatsRef, {
                    chats: [...rc, receiverChatData],
                })
            } else {
                await setDoc(receiverChatsRef, { chats: [receiverChatData] })
            }

            onBuyerSelect({ chatId, user: selectedUser })
            onClose()
        } catch (err) {
            console.error('Error creating chat:', err)
            setError(`Error creating chat: ${err.message}`)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-purple-600">
                    {roleToSearch === 'vendor'
                        ? 'Select a Vendor'
                        : 'Select a Buyer'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="relative mb-4">
                <div className="flex items-center border rounded-lg">
                    <span className="text-gray-400 ml-2">🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${roleToSearch}s...`}
                        className="w-full p-2 outline-none"
                    />
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="py-4 text-center text-gray-500">
                        Loading users...
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                            onClick={() => handleUserSelect(user)}
                        >
                            <DefaultAvatar
    user={user}
    size="md"
    className="mr-3"
    defaultImage="./avatar.png"
/>
                            <div>
                                <div className="font-medium">
                                    {user.businessName ||
                                        `${user.firstName || ''} ${user.lastName || ''}`}
                                </div>
                                {user.username && (
                                    <div className="text-sm text-gray-600">
                                        @{user.username}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center text-gray-500">
                        {searchTerm
                            ? `No ${roleToSearch}s found matching "${searchTerm}"`
                            : `No ${roleToSearch}s found`}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddBuyerChat
