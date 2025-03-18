import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../../utils/firebase'
import { getStorage } from 'firebase/storage'

const storage = getStorage()
import { generateInvoicePdf } from '../Dashboard/Invoices/InvoiceCreation/InvoicePdfGenerator'

interface Invoice {
    id: string
    vendorId: string
    buyerId: string
    status: string
    invoiceData: any // Simplified for brevity
}

/**
 * Sends an invoice notification to the buyer's chat
 * @param invoice The invoice object
 * @returns Promise that resolves when the message is sent
 */
export const sendInvoiceToChat = async (invoice: Invoice): Promise<string> => {
    try {
        const { vendorId, buyerId } = invoice

        // Step 1: Find or create a chat between vendor and buyer
        const chatId = await findOrCreateChat(vendorId, buyerId)

        // Step 2: Generate PDF from invoice
        const pdfBlob = await generateInvoicePdf(invoice)

        // Step 3: Upload PDF to Firebase Storage
        const pdfFileName = `invoices/${invoice.id}_${Date.now()}.pdf`
        const pdfRef = ref(storage, pdfFileName)
        await uploadBytes(pdfRef, pdfBlob)

        // Step 4: Get the download URL for the PDF
        const pdfUrl = await getDownloadURL(pdfRef)

        // Step 5: Add a message to the chat with invoice details and PDF link
        await addInvoiceMessageToChat(chatId, vendorId, invoice, pdfUrl)

        // Step 6: Update userchats for both users to show the new message
        await updateUserChatsWithInvoiceMessage(
            chatId,
            vendorId,
            buyerId,
            invoice
        )

        return chatId
    } catch (error) {
        console.error('Error sending invoice to chat:', error)
        throw error
    }
}

/**
 * Finds an existing chat or creates a new one between vendor and buyer
 */
const findOrCreateChat = async (
    vendorId: string,
    buyerId: string
): Promise<string> => {
    try {
        // Check if vendor has a chat with this buyer
        const vendorChatsRef = doc(db, 'userchats', vendorId)
        const vendorChatsDoc = await getDoc(vendorChatsRef)

        if (vendorChatsDoc.exists()) {
            const vendorChats = vendorChatsDoc.data().chats || []
            // Simply check for the buyerId - no need for complex ID matching
            const existingChat = vendorChats.find(
                (chat: any) => chat.receiverId === buyerId
            )

            if (existingChat) {
                return existingChat.chatId
            }
        }

        // No existing chat found, create a new one
        return createNewChat(vendorId, buyerId)
    } catch (error) {
        console.error('Error finding or creating chat:', error)
        throw error
    }
}

/**
 * Creates a new chat between vendor and buyer
 */
const createNewChat = async (
    vendorId: string,
    buyerId: string
): Promise<string> => {
    // Create a new chat document
    const chatRef = doc(collection(db, 'chats'))
    const chatId = chatRef.id

    await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [vendorId, buyerId],
    })

    const timestamp = Date.now()

    // Update vendor's userchats
    const vendorChatsRef = doc(db, 'userchats', vendorId)
    const vendorChatsDoc = await getDoc(vendorChatsRef)

    const vendorChatData = {
        chatId,
        receiverId: buyerId,
        lastMessage: 'Invoice sent',
        updatedAt: timestamp,
        isSeen: true,
    }

    if (vendorChatsDoc.exists()) {
        await updateDoc(vendorChatsRef, {
            chats: arrayUnion(vendorChatData),
        })
    } else {
        await setDoc(vendorChatsRef, {
            chats: [vendorChatData],
        })
    }

    // Update buyer's userchats
    const buyerChatsRef = doc(db, 'userchats', buyerId)
    const buyerChatsDoc = await getDoc(buyerChatsRef)

    const buyerChatData = {
        chatId,
        receiverId: vendorId,
        lastMessage: 'Invoice received',
        updatedAt: timestamp,
        isSeen: false,
    }

    if (buyerChatsDoc.exists()) {
        await updateDoc(buyerChatsRef, {
            chats: arrayUnion(buyerChatData),
        })
    } else {
        await setDoc(buyerChatsRef, {
            chats: [buyerChatData],
        })
    }

    return chatId
}

/**
 * Adds a message about the invoice to the chat
 */
const addInvoiceMessageToChat = async (
    chatId: string,
    vendorId: string,
    invoice: Invoice,
    pdfUrl: string
): Promise<void> => {
    const { invoiceData } = invoice

    const messageText = `Invoice #${invoiceData.invoiceNumber} (${invoiceData.dueDate} due date)\nTotal: CAD ${invoiceData.totals.total.toFixed(2)}\n\nPlease see the attached PDF for details.`

    const message = {
        senderId: vendorId,
        text: messageText,
        createdAt: new Date(),
        document: pdfUrl,           // Make sure this is the full URL
        documentName: `Invoice_${invoiceData.invoiceNumber}.pdf`,
        documentType: 'application/pdf',
        invoiceId: invoice.id,
    };

    await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion(message),
    })
}

/**
 * Updates the userchats documents for both users
 */
const updateUserChatsWithInvoiceMessage = async (
    chatId: string,
    vendorId: string,
    buyerId: string,
    invoice: Invoice
): Promise<void> => {
    const lastMessage = `Invoice #${invoice.invoiceData.invoiceNumber} - CAD ${invoice.invoiceData.totals.total.toFixed(2)}`
    const timestamp = Date.now()

    // Update both users' chat entries
    const userIds = [vendorId, buyerId]

    for (const userId of userIds) {
        try {
            const userChatsRef = doc(db, 'userchats', userId)
            const userChatsDoc = await getDoc(userChatsRef)

            if (userChatsDoc.exists()) {
                const userChats = userChatsDoc.data().chats || []
                const chatIndex = userChats.findIndex(
                    (chat: any) => chat.chatId === chatId
                )

                if (chatIndex !== -1) {
                    // Update existing chat entry
                    userChats[chatIndex] = {
                        ...userChats[chatIndex],
                        lastMessage,
                        updatedAt: timestamp,
                        isSeen: userId === vendorId, // Only vendor has seen the message
                    }

                    await updateDoc(userChatsRef, { chats: userChats })
                }
            }
        } catch (error) {
            console.error(`Error updating userchats for ${userId}:`, error)
        }
    }
}

export default {
    sendInvoiceToChat,
}
