
interface HeaderProps{
    userName: string;
    userRole: string;
    userImage: string;
}

const Header =({userName,userRole,userImage}:HeaderProps)=>{

    return(
        <div className="flex justify-between items-center mb-8">
      {/* Page Title */}
      <h1 className="pl-5 mt-10 font-nunito text-[60px] font-[1000]">Invoices</h1>

      {/* User Profile */}
      <div className=" mt-5 mr-10 flex items-center gap-3">
        <div className=" text-right">
          <div className=" font-bold font-nunito text-[25px]">{userName}</div>
          <div className=" font-sourceSans text-[15px]">{userRole}</div>
        </div>
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img 
            src={userImage || "/api/placeholder/40/40"} 
            alt="Profile" 
            className=" w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
    )
    
}

export default Header;
