import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import { Routes, Route } from "react-router";
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import s from './App.module.css'
import Projects from "./Pages/Projects/Projects";
import { Box, Flex } from "@radix-ui/themes";
import ProjectPage from "./Pages/Projects/ProjectPage";
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
            <Route path="/projects/:id" element={<ProjectPage />} />

          </Routes>
        </Box>
      </Flex>

    </>
  )
}

export default App
