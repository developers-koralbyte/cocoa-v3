// AddBuyerChat.jsx - Simplified ID handling
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
          id: doc.id, // Use the document ID as the primary identifier
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
      
      // Get current user ID
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        setError("User information not available. Please refresh the page and login again.");
        return;
      }
      
      if (!selectedUser || !selectedUser.id) {
        setError("Invalid user information. Please try again.");
        return;
      }
      
      // Simple ID references - no more complexity with multiple ID types
      const selectedUserId = selectedUser.id;
      
      if (currentUserId === selectedUserId) {
        setError("You cannot chat with yourself.");
        return;
      }
      
      // Check if chat already exists in current user's chats
      const userChatsRef = doc(db, 'userchats', currentUserId);
      const userChatsDoc = await getDoc(userChatsRef);
      
      if (userChatsDoc.exists()) {
        const userChatsData = userChatsDoc.data();
        const chats = userChatsData.chats || [];
        
        // Simply check for the receiverId - no need for complex ID checking
        const existingChat = chats.find(chat => chat.receiverId === selectedUserId);
        
        if (existingChat) {
          // Chat already exists, just select it
          onBuyerSelect({
            chatId: existingChat.chatId,
            user: selectedUser
          });
          onClose();
          return;
        }
      }
      
      // Create a new chat document
      const chatRef = doc(collection(db, 'chats'));
      const chatId = chatRef.id;
      
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUserId, selectedUserId]
      });
      
      // Create chat data objects
      const timestamp = Date.now();
      
      // Create chat entry for current user
      const currentUserChatData = {
        chatId,
        receiverId: selectedUserId,
        lastMessage: '',
        updatedAt: timestamp,
        isSeen: true
      };
      
      // Update current user's userchats
      if (userChatsDoc.exists()) {
        const existingChats = userChatsDoc.data().chats || [];
        await updateDoc(userChatsRef, {
          chats: [...existingChats, currentUserChatData]
        });
      } else {
        await setDoc(userChatsRef, {
          chats: [currentUserChatData]
        });
      }
      
      // Create chat entry for selected user
      const receiverChatData = {
        chatId,
        receiverId: currentUserId,
        lastMessage: '',
        updatedAt: timestamp,
        isSeen: false
      };
      
      // Update selected user's userchats
      const receiverChatsRef = doc(db, 'userchats', selectedUserId);
      const receiverChatsDoc = await getDoc(receiverChatsRef);
      
      if (receiverChatsDoc.exists()) {
        const receiverChats = receiverChatsDoc.data().chats || [];
        await updateDoc(receiverChatsRef, {
          chats: [...receiverChats, receiverChatData]
        });
      } else {
        await setDoc(receiverChatsRef, {
          chats: [receiverChatData]
        });
      }
      
      // Select the new chat
      onBuyerSelect({
        chatId,
        user: selectedUser
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating chat:", error);
      setError(`Error creating chat: ${error.message}. Please try again.`);
    }
  };

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    if (currentUser?.id) {
      return currentUser.id;
    }
    
    // Fallback to localStorage if needed
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData.id || userData.uid; // Support older format that might use uid
    }
    
    return null;
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