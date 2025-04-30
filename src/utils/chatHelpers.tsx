import {
  collection, doc, getDoc, setDoc, updateDoc,
  serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Find an existing chat between two users or create one and return the chatId.
 */
export const findOrCreateChat = async (userAId, userBId) => {
  // 📝 deterministic key so either user can “own” the chat document
  const chatKey = userAId < userBId ? `${userAId}_${userBId}` : `${userBId}_${userAId}`;
  const chatRef = doc(db, 'chats', chatKey);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      createdAt: serverTimestamp(),
      participants: [userAId, userBId],
      messages: []
    });
  }
  return chatRef.id;              
};

/**  very small profile snippet for the sidebar  */
export const fetchUserBasic = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { id: uid, firstName: 'Unknown' };
  return { id: uid, ...snap.data() };
};

/**  optional “system” message, totally safe to no-op  */
export const sendSystemMessage = async (chatId, text) => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    messages: arrayUnion({
      senderId: 'system',
      text,
      createdAt: new Date(),
      isNotification: true
    })
  });
};
