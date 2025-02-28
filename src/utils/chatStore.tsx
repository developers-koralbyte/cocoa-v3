// utils/chatStore.ts
import { create } from 'zustand'
import { useUserStore } from './userStore'

export const useChatStore: any = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  showChatlist: true,

  changeChat: (chatId: any, user: any) => {
    const currentUser = useUserStore.getState().currentUser
    if (!currentUser || !user) {
      return // bail out if we have no data
    }

    // Check if the current user is blocked by the other user
    if (user.blocked?.includes(currentUser.id)) {
      set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
        showChatlist: false,
      })
    }
    // Check if the other user is blocked by the current user
    else if (currentUser.blocked?.includes(user.id)) {
      set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
        showChatlist: false,
      })
    } else {
      set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        showChatlist: false,
      })
    }
  },

  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    })
  },
}))
