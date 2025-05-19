import { Routes, Route, Navigate } from "react-router";
import { Box, Flex, Text } from "@radix-ui/themes";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { API_URL, axiosConfig } from "./config/api";
import axios from "axios";

import s from './App.module.css'

import Navbar from "./Components/Navbar/Navbar"
import Sidebar from "./Components/Sidebar/Sidebar"
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import Projects from "./Pages/Projects/Projects";
import ProjectPage from "./Pages/Projects/ProjectPage";
import Profile from "./Pages/Profile/Profile";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import PolicyManagement from "./Pages/Admin/PolicyManagement";
import Permission from "./Components/Permission/Permission";

import { User } from "@my-types/types";
import { set } from "date-fns";

export const userAtom = atom<User | null>(null);

function App() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/status`, axiosConfig);

        if (data.isAuthenticated && !data.user.isNewUser) {
          console.log('User is authenticated:', data.isAuthenticated);
          setUser(data.user);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false)
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, [setUser]);

  return (
    <>
      {
     !loading ? (
      user ? (
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
                <Route path="/profile/:userId" element={<Profile />} />
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
      )

    ):(
      loading
    )
    }
    </>
  )
}

export default App
