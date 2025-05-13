import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import { Routes, Route, Navigate } from "react-router";
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import s from './App.module.css'
import Projects from "./Pages/Projects/Projects";
import { Box, Flex, Text } from "@radix-ui/themes";
import ProjectPage from "./Pages/Projects/ProjectPage";
import Profile from "./Pages/Profile/Profile";
import { atom, useAtom } from "jotai";
import { UserProfile } from "./types";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import { useEffect } from "react";
import axios from "axios";
import { API_URL, axiosConfig } from "./config/api";
import PolicyManagement from "./Pages/Admin/PolicyManagement";
import Permission from "./Components/Permission/Permission";

export const userAtom = atom<UserProfile | null>(null);

function App() {
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/status`, axiosConfig);

        if (data.isAuthenticated && !data.user.isNewUser) {
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
              <Route
                path="/admin/policies"
                element={
                  <Permission
                    action="manage"
                    resourceType="policy"
                    fallback={
                      <Box p="6">
                        <Text size="5" color="red">
                          You don't have permission to manage policies.
                          This area is restricted to administrators.
                        </Text>
                      </Box>
                    }
                  >
                    <PolicyManagement />
                  </Permission>
                }
              />
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
