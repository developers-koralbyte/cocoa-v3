import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { create } from 'zustand'
import { db } from './firebase'

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  showDetailPage: false,

  fetchUserInfo: async (uid: string | { uid: string }) => {
    console.log("Attempting to fetch user with ID:", uid);
    
    if (!uid) {
      console.log("No UID provided, clearing user");
      return set({ currentUser: null, isLoading: false });
    }
  
    // Ensure uid is a string and not an object
    const userIdString = typeof uid === 'object' ? uid.uid || String(uid) : String(uid);
    console.log("Using user ID (as string):", userIdString);
    
    try {
      // First, try the direct document lookup
      const docRef = doc(db, 'users', userIdString);
      console.log("Created document reference for:", userIdString);
      
      let docSnap = await getDoc(docRef);
      console.log("Got document snapshot, exists:", docSnap.exists());
  
      // If the document doesn't exist at the expected path, try querying
      if (!docSnap.exists()) {
        console.log("Document not found at direct path, trying query...");
        
        // Try to query by UID field in case the document ID is different
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("id", "==", userIdString));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          docSnap = querySnapshot.docs[0];
          console.log("User found via query instead");
        } else {
          console.log("User not found in collection after query");
          return set({ currentUser: null, isLoading: false });
        }
      }
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data retrieved:", userData);
        set({ currentUser: { id: userIdString, ...userData }, isLoading: false });
      } else {
        console.log("No user document found");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      set({ isLoading: false });
    }
  },

  setShowDetailPage: () => set({ showDetailPage: true }),
  resetShowDetailPage: () => set({ showDetailPage: false }),
}))