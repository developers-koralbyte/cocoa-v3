import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Notification = () => {
    return (
        <div>
            <ToastContainer
                position="top-right"
                closeOnClick={false}
                autoClose={5000}
                hideProgressBar={true}
            />
        </div>
    )
}

export default Notification
