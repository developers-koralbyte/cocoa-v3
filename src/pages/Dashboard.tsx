import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()
    return (
        <h2
            className="text-4xl items-center rounded-full  p-20 bg-red-200 justify-center flex mt-10 mx-auto sm-w-100 hover:bg-orange-700 text-white m-5"
            onClick={() => navigate('/chat')}
        >
            Chat
        </h2>
    )
}

export default Dashboard
