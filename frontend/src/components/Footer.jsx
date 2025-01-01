import React from "react";
import {RiLinkedinFill} from 'react-icons/ri'
import {AiFillGithub} from 'react-icons/ai'
import {Link} from 'react-router-dom'

const socialLinks = [
    {
        path: "https://www.linkedin.com/in/farhaan-jamal/",
        icon: <RiLinkedinFill className="group-hover:text-white w-4 h-5"/>
    },
    {
        path: "https://github.com/FarhaanJamal",
        icon: <AiFillGithub className="group-hover:text-white w-4 h-5"/>
    }
]

const support = {
    path: "mailto:farhaanjamal456@gmail.com",
    display: "Contact Us"
}


const Footer = () => {
    return <footer>
        <div className="container p-0 mt-[20px]">
            <div className="mx-[35px] rounded-t-[18px] bg-mainColor p-[20px] pb-[10px] flex justify-around flex-col md:flex-row flex-wrap gap-[2px]">
                <div className="flex justify-between flex-col h-[62px]">
                    <h2 className="text-[16px] pt-[5px] font-semibold">Support</h2>
                    <Link to={support.path} className="ml-[15px] text-[14px] leading-7 font-medium">{support.display}</Link>
                </div>
                <div className="md:mt-0 mt-[15px] flex justify-between h-[62px] flex-col">
                    <h2 className="text-[16px] pt-[5px] font-semibold">Developed By</h2>
                    <div className="flex items-center md:px-[5px] md:pt-[5px] gap-3">
                        <p className="text-[14px] ml-[15px] leading-7 font-medium">Farhaan J</p>
                        {socialLinks.map((link, index) => (
                            <Link to={link.path} key={index} className="w-7 h-7 border border-solid border-accentColorBlue rounded-full flex items-center justify-center group hover:bg-secondaryColor hover:border-none">{link.icon}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </footer>
};

export default Footer;