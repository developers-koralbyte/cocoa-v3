import { useEffect, useState } from 'react'
import './chatList.css'
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
            <div className="chatList">
                <div className="search">
                    <div className="searchBar">
                        <img src={searchIcon} alt="search" />
                        <input
                            type="text"
                            placeholder="Search"
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <img
                        src={addMode ? minus : plus}
                        alt="toggle add user"
                        className="add"
                        onClick={() => setAddMode((prev) => !prev)}
                    />
                </div>

                {/* Conditional rendering for either the chat list or AddUser */}
                {!addMode ? (
                    filteredChats.map((chat) => (
                        <div
                            className="item"
                            key={chat.chatId}
                            onClick={() => handleSelect(chat)}
                            style={{
                                backgroundColor:
                                    chat?.chatId === chatId
                                        ? 'rgba(17, 25, 40, 0.9)' // Ensure the rgba value is a string
                                        : 'transparent',
                                position: 'relative', // Make the parent relatively positioned for correct placement of the green dot
                            }}
                        >
                            <img
                                src={
                                    chat.user.blocked.includes(currentUser.id)
                                        ? './avatar.png'
                                        : chat.user.avatar || './avatar.png'
                                }
                                alt="avatar"
                            />
                            <div className="texts">
                                <span>
                                    {chat.user.blocked.includes(currentUser.id)
                                        ? 'User'
                                        : chat.user.username}
                                </span>
                                <p>{chat.lastMessage}</p>
                            </div>

                            {/* Green dot for seen chats */}
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
                )}
            </div>
        </>
    )
}

export default ChatList
