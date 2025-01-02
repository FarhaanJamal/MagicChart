import React, { useState, useEffect } from "react";
import {NavLink, Link, useNavigate} from 'react-router-dom'
import { BASE_URL } from "../config";
import logoWithName from '../assets/images/logo-with-name.png'
import {toast} from 'react-toastify'
import Footer from "../components/Footer"


const Login = () => {
    const [formData, setFormData] = useState({
        uname: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    
    useEffect(() => {
        toast.info("Server may take up to 50 seconds if idle.");
        toast.info("Thank you for your patience!");
    }, []);

    const handleInputChange = e => {
        setFormData({ ... formData, [e.target.name]: e.target.value})
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData1 = {
                name: formData.uname,
                password: formData.password
            }
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData1),
                mode: "cors"
            })
            setLoading(false)
            if (response.ok){
                localStorage.removeItem('userData')
                const result = await response.json()
                const userData = {
                    username: formData1.name,
                    lastLogin: new Date().toISOString()
                }
                localStorage.setItem("userData", JSON.stringify(userData));
                toast.success(result.message)
                navigate("/home")
            } else {
                const err = await response.json()
                toast.error(err.detail)
            }
        } catch (err) {
            setLoading(false)
            toast.error("Failed to connect to the server.")
        }
    }

    return <>
        <div className="min-h-screen min-w-[354px] flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="w-[768px]">
                    <div className="h-[200px] sm:h-[250px] flex justify-center items-center">
                        <img  className="object-cover w-[300px] sm:w-[450px]" src={logoWithName} alt="" />
                    </div>
                    <div className="container">
                        <div className="rounded-[18px] mx-[20px] bg-mainColor shadow-xl text-accentColorLightBlue">
                            <h3 className=" text-[22px] p-[30px] font-bold">Hello! <span className="text-secondaryColor">Welcome</span> back 👋</h3>
                            <form className="py-4 md:py-0" onSubmit={handleLogin}>
                                <div className="p-5 pt-0 flex flex-col gap-5">
                                    <input className="px-4 py-3 border-b border-solid border-accentColorLightBlue focus:outline-none focus:border-b-mainColor text-[16px] leading-7 text-accentColorWhite placeholder:opacity-75 rounded-[18px] cursor-pointer" placeholder="UserName" name="uname" value={formData.uname} onChange={handleInputChange}/>
                                    <input type="password" className="px-4 py-3 border-b border-solid border-accentColorLightBlue focus:outline-none focus:border-b-mainColor text-[16px] leading-7 text-accentColorWhite placeholder:opacity-75 rounded-[18px] cursor-pointer" placeholder="Password" name="password" value={formData.password} onChange={handleInputChange}/>
                                    <button type="submit" className=" rounded-[50px] font-semibold p-2 mx-2 bg-secondaryColor text-accentColorLightBlue">
                                        {loading ? 'Loading..' : "Login"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="m-[35px] mb-0 text-[14px] indent-6">
                        ** This is my personal project, visit my <Link to="https://github.com/FarhaanJamal/MagicGraph" className="text-accentColorBlue font-extrabold cursor-pointer">GitHub</Link> for demo video.
                    </div>
                    <div className="m-[35px] mt-0 text-[14px] indent-6">
                        ** If you are eager about this, <Link to="mailto:farhaanjamal456@gmail.com" className="text-accentColorBlue font-extrabold cursor-pointer">mail</Link> me to get access.
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    </>
};

export default Login;
