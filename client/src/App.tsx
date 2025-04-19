import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import { Routes, Route } from "react-router";
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import s from './App.module.css'
import Projects from "./Pages/Projects/Projects";
import { Box, Flex } from "@radix-ui/themes";
function App() {

  return (
    <>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box id={s.mainContainer}>  
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </Box>
      </Flex>

    </>
  )
}

export default App
