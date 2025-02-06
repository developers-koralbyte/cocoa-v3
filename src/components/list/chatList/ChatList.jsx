import { useEffect, useState } from 'react'
import AddUser from './addUser/addUser'
import { useUserStore } from '../../../utils/userStore'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { useChatStore } from '../../../utils/chatStore'
import searchIcon from '../../../assets/img/chatImages/search.png'
import minus from '../../../assets/img/chatImages/minus.png'
import plus from '../../../assets/img/chatImages/plus.png'
const ChatList = () => {
    const [chats, setChats] = useState([])
    const [addMode, setAddMode] = useState(false)
    const [input, setInput] = useState('')

    const { currentUser } = useUserStore()
    const { chatId, changeChat } = useChatStore()

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, 'userchats', currentUser.id),
            async (res) => {
                const items = res.data().chats

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, 'users', item.receiverId)
                    const userDocSnap = await getDoc(userDocRef)

                    const user = userDocSnap.data()

                    return { ...item, user }
                })

                const chatData = await Promise.all(promises)

                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
            }
        )

        return () => {
            unSub()
        }
    }, [currentUser.id])

    const handleSelect = async (chat) => {
        const userChats = chats.map((item) => {
            const { user, ...rest } = item
            return rest
        })

        const chatIndex = userChats.findIndex(
            (item) => item.chatId === chat.chatId
        )

        userChats[chatIndex].isSeen = true

        const userChatsRef = doc(db, 'userchats', currentUser.id)

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            })
            changeChat(chat.chatId, chat.user)
        } catch (error) {
            console.log(error)
        }
    }

    const filteredChats = chats.filter((c) =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    )

    return (
        <>
            <div class="border-b-2 py-4 px-2 border-t-2">
                <input
                    type="text"
                    placeholder="Search"
                    onChange={(e) => setInput(e.target.value)}
                    class="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
                />
            </div>
            {!addMode ? (
                filteredChats.map((chat) => (
                    <div
                        className="flex flex-row py-4 px-2 items-center border-b-2"
                        key={chat.chatId}
                        onClick={() => handleSelect(chat)}
                    >
                        <div className="w-1/4">
                            <img
                                src={chat.user.avatar || './avatar.png'}
                                className="object-cover h-12 w-12 rounded-full"
                                alt=""
                            />
                        </div>
                        <div className="w-full">
                            <div className="text-lg font-semibold">
                                {chat.user.blocked.includes(currentUser.id)
                                    ? 'User'
                                    : chat.user.username}
                            </div>
                            <span className="text-gray-500">
                                {chat.lastMessage}
                            </span>
                        </div>

                        {!chat.isSeen && (
                            <div
                                className="seen-dot"
                                style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: '#17b617',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    right: '10px', // Adjust this value to match your design
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            ></div>
                        )}
                    </div>
                ))
            ) : (
                <AddUser setAddMode={setAddMode} searchIcon={searchIcon} />
            )}{' '}
        </>
    )
}

export default ChatList
