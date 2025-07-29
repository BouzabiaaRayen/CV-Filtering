import { useState } from "react";
import { Link } from "react-router-dom";
import UploadCV from "./UploadCV";




const Suivie = () => {
    const HandleLogout=()=>{
        alert("logout succefully");
    }
type Props = { children?: React.ReactNode };

    return(
        <div className="flex min-h-screen bg-white">
        <aside className="w-60 bg-gray-50 p-6 border-r">
            <h2 className=" text-blue-600 font-bold text-2xl  ">ProxymHR</h2>
            <nav className="mt-10 space-y-4">
                <div className="font-semibold text-black"><Link to="/client" className="hover:underline">Profile</Link></div>
                <div className="text-gray-600  hover:underline hover:text-blue-600 font-semibold" ><Link to='/UploadCV'>Upload CV</Link></div>
                <div className="text-gray-600  hover:underline hover:text-blue-600 font-semibold" >Suivie</div>
            </nav>
            <button onClick={HandleLogout} className="hover:underline text-red-500 mt-20 position: absolute bottom-6 left">Log Out</button>
        </aside>
    </div>
    )
}

export default Suivie;