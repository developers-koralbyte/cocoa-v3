import ChatList from './chatList/ChatList'
import './list.css'
import Userinfo from './userInfo/Userinfo'

const List = ({ currentUser }) => {
    return (
        <div className="list">
            <ChatList />
        </div>
    )
}

export default List
