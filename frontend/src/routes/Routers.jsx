import React from "react";
import Home from "../pages/Home";
import Login from "../pages/Login";

import {Routes, Route} from 'react-router-dom';


const Routers = () => {
    return <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
    </Routes>
};

export default Routers;