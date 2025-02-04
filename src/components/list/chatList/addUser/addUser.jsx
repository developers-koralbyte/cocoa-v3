import './addUser.css'
import { db } from '../../../../utils/firebase'
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { useUserStore } from '../../../../utils/userStore'

const AddUser = ({ setAddMode, searchIcon }) => {
    const [user, setUser] = useState(null)

    const { currentUser, fetchUserInfo } = useUserStore()

    useEffect(() => {
        if (localStorage.getItem('user') !== null) {
            const userId = JSON.parse(localStorage.getItem('user'))
            fetchUserInfo(userId)
        } else {
            fetchUserInfo()
        }
    }, [fetchUserInfo])

    const handleSearch = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get('username')

        try {
            const userRef = collection(db, 'users')

            const q = query(userRef, where('username', '==', username))

            const querySnapShot = await getDocs(q)

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data())
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleAdd = async () => {
        const chatRef = collection(db, 'chats')
        const userChatsRef = collection(db, 'userchats')

        try {
            const newChatRef = doc(chatRef)

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            })

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: '',
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            })

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: '',
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            })

            setAddMode(false)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <div className="search-user">
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        className="username"
                    />
                    {/* <button type=
                    "submit" className="search-btn"> */}
                    <button>Search</button>
                    {/* </button> */}
                </div>
            </form>

            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={user.avatar || './avatar.png'} alt="" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd}>Add User</button>
                </div>
            )}
        </div>
    )
}

export default AddUser
