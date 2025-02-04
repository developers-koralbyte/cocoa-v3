import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Notification from './components/notification/Notification.tsx'

createRoot(document.getElementById('root')!).render(
    <>
    <Notification/>
    <App />
    </>
)
