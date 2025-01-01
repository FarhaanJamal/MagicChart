import {useEffect, useRef, useState} from "react";
import logoWithName from "../assets/images/logo-with-name.png"
import {NavLink, Link, useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'

const Header = () => {
    const headerRef = useRef(null)
    const navigate = useNavigate()

    const [username, setUsername] = useState("")

    const handleStickyHeader = () => {
        window.addEventListener('scroll', () =>{
            if(document.body.scrollTop < 70 || document.documentElement.scrollTop > 70){
                headerRef.current.classList.add('sticky__header')
            }else{
                headerRef.current.classList.remove('sticky__header')
            }
        })
        
    }
    useEffect(() => {
        handleStickyHeader()
        return () => window.removeEventListener('scroll', handleStickyHeader)
    })
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'))
        if (userData) {
            const lastLoginDate = new Date(userData.lastLogin)
            const currentDate = new Date()
            const daysSinceLastLogin = Math.ceil((currentDate - lastLoginDate) / (1000 * 60 * 60 * 24))
            if (daysSinceLastLogin <= 2){
                setUsername(userData.username)
            } else {
                localStorage.removeItem('userData')
                navigate('/login')
                toast.error("Login to get the access")
            }
        } else {
            navigate('/login')
        }
    }, [navigate])

    return <header className="header rounded-b-[18px] flex items-center h-[70px]" ref={headerRef}>
        <div className="container">
            <div className="flex items-center justify-between">
                <div>
                    <img className="w-[150px] md:w-[200px] object-cover cursor-pointer" src={logoWithName} alt="Logo" />
                </div>
                <div className="flex flex-row text-accentColorLightBlue items-center justify-around md:gap-4 gap-2">
                    <p className="text-secondaryColor flex-none text-[16px]">
                        {username ? `Hi ${username}` : "Hi Guest"}
                    </p>
                    <div onClick={() => {
                        localStorage.removeItem('userData')
                        navigate('/login')
                        }} className="text-accentColorLightBlue flex-none text-[14px] md:text-[16px] cursor-pointer">
                            Logout
                    </div>
                </div>
            </div>
        </div>
    </header>
};

export default Header;