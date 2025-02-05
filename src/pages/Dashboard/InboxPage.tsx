import { useNavigate } from 'react-router-dom';
import BaseLayout from "../../components/Dashboard/BaseLayout";
import chatImage from "../../assets/img/Dashboard/chatImage.png";

const InboxPage = () =>{
    const navigate = useNavigate();
    
    return (
        <>
            <BaseLayout>
               <></>
            </BaseLayout>
            
            {/* Chat Image/Button */}
            <div 
                className="fixed bottom-3 right-10  cursor-pointer z-50"
                onClick={() => navigate('/chat')}
            >
                <img 
                    src={chatImage} 
                    alt="Chat" 
                    className=" hover:opacity-90 transition-opacity"
                />
            </div>
        </>
    )

}

export default InboxPage;
