import { Avatar } from "../Reusable/utils";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function UserInfo() {
    const [authToken, setAuthToken] = useState(Cookies.get("authToken"));
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                'http://localhost:5000/api/update',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            console.log('User info updated:', response.data);
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    };
    
    return (
        <div className='w-full p-8 pb-4 flex flex-col gap-y-6'>
            <h1 className='text-blue-700 text-xl font-extrabold'>Personal Information</h1>
            <div className="flex flex-row w-full justify-between">
                <div className="w-3/12 h-full flex items-center justify-center">
                <Avatar
                size={'text-9xl'}/>
                </div>
                <div className="flex flex-col p-3 flex-wrap gap-y-4 w-6/12">
                    <div className="flex flex-col w-full gap-y-2">
                        <label htmlFor="firstname" className="text-sm font-medium text-gray-500">First Name</label>
                        <input name='firstname' className='w-8/12 p-2 border border-gray-300 rounded-lg' type="text"
                        onChange={(e)=>handleChange(e)} />
                    </div>
                    <div className="flex flex-col w-full gap-y-2">
                        <label htmlFor="lastname" className="text-sm font-medium text-gray-500">Last Name</label>
                        <input name='lastname' className='w-8/12 p-2 border border-gray-300 rounded-lg' type="text"
                        onChange={(e)=>handleChange(e)} />
                    </div>
                    <div className="flex flex-col w-full gap-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-500">E-mail</label>
                        <input name='email' className='w-8/12 p-2 border border-gray-300 rounded-lg' type="email"
                        onChange={(e)=>handleChange(e)} />
                    </div>
                </div>
                <div className="relative w-3/12">
                    <button className=' absolute bg-blue-700 text-white px-4 py-2 rounded-lg bottom-3 left-0' onClick={(e)=>handleSubmit(e)}>Save</button>
                </div>
            </div>
        </div>
    )
}