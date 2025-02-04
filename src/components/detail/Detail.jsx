import { useState } from 'react'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { useChatStore } from '../../utils/chatStore'
import { auth, db } from '../../utils/firebase'
import { useUserStore } from '../../utils/userStore'
import './detail.css'
import arrowDown from '../../assets/img/chatImages/arrowDown.png'
import backBtn from '../../assets/img/chatImages/back-icon.png'
import whiteCross from '../../assets/img/chatImages/whiteCross.png'

const Detail = () => {
    const {
        chatId,
        user,
        isCurrentUserBlocked,
        isReceiverBlocked,
        changeBlock,
        resetChat,
    } = useChatStore()
    const { currentUser, resetShowDetailPage } = useUserStore()
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    const handleBlock = async () => {
        if (!user) return

        const userDocRef = doc(db, 'users', currentUser.id)

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked
                    ? arrayRemove(user.id)
                    : arrayUnion(user.id),
            })
            changeBlock()
        } catch (err) {
            console.log(err)
        }
    }

    const handleLogout = () => {
        auth.signOut()
        resetChat()
        localStorage.removeItem('user')
    }

    return (
        <div className="detail">
            <div className="user">
                {isMobile && (
                    <img
                        style={{ position: 'absolute', left: '5%' }}
                        className="back-btn"
                        src={backBtn}
                        onClick={() => resetShowDetailPage()}
                    />
                )}
                {!isMobile && (
                    <img
                        style={{
                            position: 'absolute',
                            right: '1%',
                            top: '2%',
                            width: '25px',
                            height: '25px',
                        }}
                        // className="back-btn"
                        src={whiteCross}
                        onClick={() => resetShowDetailPage()}
                    />
                )}
                <img src={user?.avatar || './avatar.png'} alt="" />
                <h2>{user?.username}</h2>
            </div>
            <div className="info">
                {/* <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div> */}
                {/* <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div> */}
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src={arrowDown} alt="" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src={arrowDown} alt="" />
                    </div>
                </div>
                <button onClick={handleBlock}>
                    {isCurrentUserBlocked
                        ? 'You are Blocked!'
                        : isReceiverBlocked
                          ? 'User blocked'
                          : 'Block User'}
                </button>
                <button className="logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Detail
