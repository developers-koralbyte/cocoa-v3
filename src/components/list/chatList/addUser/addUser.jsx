// components/list/chatList/addUser/addUser.jsx
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
    const storedUser = localStorage.getItem('user')
    if (storedUser !== null) {
      fetchUserInfo(JSON.parse(storedUser))
    } else {
      fetchUserInfo()
    }
  }, [fetchUserInfo])

  const handleSearch = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get('username')

    try {
      // Search for user doc by 'username'
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
    if (!user?.id || !currentUser?.docId) return

    try {
      // 1) Create a new chat doc
      const chatRef = collection(db, 'chats')
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        // optionally participants: [currentUser.id, user.id]
      })

      // 2) Update userchats for the "other" user (the one you found)
      await updateDoc(doc(db, 'userchats', user.docId || user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: currentUser.id, // or docId if your logic uses that
          updatedAt: Date.now(),
          isSeen: false,
        }),
      })

      // 3) Update userchats for the "current" user
      await updateDoc(doc(db, 'userchats', currentUser.docId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: user.id,
          updatedAt: Date.now(),
          isSeen: true,
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
          <button>Search</button>
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
