// AddBuyerChat.jsx
import { useState, useEffect } from 'react';
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useUserStore } from '../../utils/userStore';

const AddBuyerChat = ({ onClose, onBuyerSelect, userRole, searchRole }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore();

  // Determine which role to search for
  const roleToSearch = searchRole || (userRole === 'vendor' ? 'buyer' : 'vendor');

  // Fetch users with the appropriate role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersRef = collection(db, 'users');
        // Query users with the appropriate role
        const q = query(usersRef, where('role', '==', roleToSearch));
        const querySnapshot = await getDocs(q);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          docId: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${roleToSearch}s:`, error);
        setError(`Failed to load users: ${error.message}`);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleToSearch]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const businessName = (user.businessName || '').toLowerCase();
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const username = (user.username || '').toLowerCase();
      
      return businessName.includes(lowerSearchTerm) || 
             fullName.includes(lowerSearchTerm) ||
             username.includes(lowerSearchTerm);
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Create a new chat with the selected user
  const handleUserSelect = async (selectedUser) => {
    try {
      setError(null);
      
      // Get current user from localStorage if not available in store
      let userToUse = currentUser;
      if (!userToUse || !userToUse.docId) {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // If the stored user has uid but no docId, they are the same in your system
          userToUse = {
            ...parsedUser,
            docId: parsedUser.docId || parsedUser.uid,
            id: parsedUser.id || parsedUser.uid
          };
        } else {
          setError("User information not available. Please refresh the page and login again.");
          return;
        }
      }
      
      if (!userToUse.docId) {
        setError("User ID not available. Please refresh and try again.");
        return;
      }
      
      if (!selectedUser || !selectedUser.id) {
        setError("Invalid user information. Please try again.");
        return;
      }
      
      // Ensure we have valid IDs for both users - store multiple ID types for better matching
      const currentUserData = {
        primaryId: userToUse.docId,
        uid: userToUse.uid || userToUse.docId,
        id: userToUse.id || userToUse.docId,
        docId: userToUse.docId
      };
      
      const selectedUserData = {
        primaryId: selectedUser.docId || selectedUser.id,
        uid: selectedUser.uid || selectedUser.id,
        id: selectedUser.id || selectedUser.docId,
        docId: selectedUser.docId || selectedUser.id
      };
      
      // Use the primary IDs for the main logic
      const currentUserId = currentUserData.primaryId;
      const selectedUserId = selectedUserData.primaryId;
      
      if (currentUserId === selectedUserId) {
        setError("You cannot chat with yourself.");
        return;
      }
      
      // Check if chat already exists in current user's chats
      // We need to check against all possible IDs of the selected user
      const userChatsRef = doc(db, 'userchats', currentUserId);
      const userChatsDoc = await getDoc(userChatsRef);
      
      if (userChatsDoc.exists()) {
        const userChatsData = userChatsDoc.data();
        const chats = userChatsData.chats || [];
        
        // Create an array of all possible IDs for the selected user
        const possibleIds = [
          selectedUserId,
          selectedUser.uid,
          selectedUser.id,
          selectedUser.docId
        ].filter(Boolean);
        
        // Check if any of the existing chats have a receiver ID matching any of the selected user's IDs
        const existingChat = chats.find(chat => 
          possibleIds.includes(chat.receiverId)
        );
        
        if (existingChat) {
          // Chat already exists, just select it
          onBuyerSelect({
            chatId: existingChat.chatId,
            user: selectedUser
          });
          onClose();
          return;
        }
        
        // Also check if there's an existing chat based on selectedUser's username or other unique identifiers
        if (selectedUser.username) {
          // Fetch all users to check if any match the selected user
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', selectedUser.username));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Get all possible IDs from these matching users
            const userIds = querySnapshot.docs.map(doc => doc.id);
            
            // Check if any existing chat has a receiverId matching any of these IDs
            const chatByUsername = chats.find(chat => userIds.includes(chat.receiverId));
            
            if (chatByUsername) {
              onBuyerSelect({
                chatId: chatByUsername.chatId,
                user: selectedUser
              });
              onClose();
              return;
            }
          }
        }
      }
      
      // Create a new chat document
      const chatRef = collection(db, 'chats');
      const newChatRef = doc(chatRef);
      const chatId = newChatRef.id;
      
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUserId, selectedUserId]
      });
      
      // Update current user's chats
      const newChatData = {
        chatId: chatId,
        lastMessage: '',
        receiverId: selectedUserId,
        updatedAt: Date.now(),
        isSeen: true,
      };
      
      if (!userChatsDoc.exists()) {
        // Create userchats doc for current user if it doesn't exist
        await setDoc(userChatsRef, {
          chats: [newChatData]
        });
      } else {
        // Carefully add to existing chats array
        const existingChats = userChatsDoc.data().chats || [];
        await updateDoc(userChatsRef, {
          chats: [...existingChats, newChatData]
        });
      }
      
      // Update the selected user's chats
      // Try multiple variations of the user ID to find the right document
      const potentialReceiverIds = [
        selectedUserId,
        selectedUser.uid,
        selectedUser.id,
        selectedUser.docId
      ].filter(Boolean);
      
      let receiverUpdateSuccess = false;
      
      for (const receiverId of potentialReceiverIds) {
        if (receiverUpdateSuccess) break;
        
        try {
          const receiverChatsRef = doc(db, 'userchats', receiverId);
          const receiverChatsDoc = await getDoc(receiverChatsRef);
          
          const receiverChatData = {
            chatId: chatId,
            lastMessage: '',
            receiverId: currentUserId, // The current user is the receiver from their perspective
            updatedAt: Date.now(),
            isSeen: false,
          };
          
          if (receiverChatsDoc.exists()) {
            const receiverChats = receiverChatsDoc.data().chats || [];
            // Check for duplicate before adding
            const existingChatIndex = receiverChats.findIndex(c => c.chatId === chatId);
            
            if (existingChatIndex >= 0) {
              receiverUpdateSuccess = true;
              break;
            }
            
            await updateDoc(receiverChatsRef, {
              chats: [...receiverChats, receiverChatData]
            });
            receiverUpdateSuccess = true;
          } else {
            // Create userchats doc for receiver if it doesn't exist
            await setDoc(receiverChatsRef, {
              chats: [receiverChatData]
            });
            receiverUpdateSuccess = true;
          }
        } catch (error) {
          // Try the next ID
        }
      }
      
      // Select the new chat
      onBuyerSelect({
        chatId: chatId,
        user: selectedUser
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating chat:", error);
      setError(`Error creating chat: ${error.message}. Please try again.`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-600">
          {roleToSearch === 'vendor' ? 'Select a Vendor' : 'Select a Buyer'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Search Input */}
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
      
      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
              onClick={() => handleUserSelect(user)}
            >
              <img 
                src={user.avatar || './avatar.png'} 
                alt={roleToSearch === 'vendor' ? 'Vendor' : 'Buyer'} 
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="font-medium">
                  {user.businessName || `${user.firstName || ''} ${user.lastName || ''}`}
                </div>
                <div className="text-sm text-gray-600">
                  {user.username && <span>@{user.username}</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-500">
            {searchTerm ? `No ${roleToSearch}s found matching "${searchTerm}"` : `No ${roleToSearch}s found`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBuyerChat;