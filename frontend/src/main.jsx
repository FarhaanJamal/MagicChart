import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastContainer 
      theme='light'
      position='top-right'
      autoClose={3000}
      closeOnClick
      style={{ zIndex: 99 }}/>
    <App/>
  </BrowserRouter>
)