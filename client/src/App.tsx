import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import { Routes, Route, Navigate } from "react-router";
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import s from './App.module.css'
import Projects from "./Pages/Projects/Projects";
import { Box, Flex } from "@radix-ui/themes";
import ProjectPage from "./Pages/Projects/ProjectPage";
import Profile from "./Pages/Profile/Profile";
import { atom, useAtom } from "jotai";
import { UserProfile } from "./types";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import { useEffect } from "react";

export const userAtom = atom<UserProfile | null>(null);

function App() {
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.isAuthenticated && data.user.isNewUser != true) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, [setUser]);

  return (
    <>
      {user ? (
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
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Box>
          </Flex>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  )
}

export default App
