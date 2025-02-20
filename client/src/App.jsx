import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import { Routes, Route } from "react-router";
import Home from "./Pages/Home/Home";
import s from './App.module.css'
function App() {

  return (
    <>
      <Navbar />
      <div id={s.mainContainer}>
      <Sidebar />
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
      </div>

    </>
  )
}

export default App
