import { Box, Button, Card, Flex, Heading, Text, TextArea, TextField } from "@radix-ui/themes";
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../App";
import axios from "axios";
import { API_URL, axiosConfig } from "../../config/api";

const Register = () => {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState(searchParams.get("name") || "");
    const [surname, setSurname] = useState(searchParams.get("surname") || "");
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [, setUser] = useAtom(userAtom);

    useEffect(() => {
        if (!searchParams.get("email")) {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const { data } = await axios.post(
                `${API_URL}/auth/complete-registration`,
                { name, surname, email, phoneNumber, bio },
                axiosConfig
            );
            setUser(data.user);
            navigate("/home");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Registration failed");
            } else {
                setError("Registration failed");
            }
        }
    };

    return (
        <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
            <Card size="3" style={{ width: "400px" }}>
                <Flex direction="column" gap="4">
                    <Heading align="center">Complete Your Profile</Heading>
                    {error && (
                        <Text color="red" align="center">
                            {error}
                        </Text>
                    )}
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="3">
                            <Box>
                                <TextField.Root
                                    placeholder="First Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Box>
                            <Box>
                                <TextField.Root
                                    placeholder="Last Name"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    required
                                />
                            </Box>
                            <Box>
                                <TextField.Root
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled
                                />
                            </Box>
                            <Box>
                                <TextField.Root
                                    placeholder="Phone Number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </Box>
                            <Box>
                                <TextArea
                                    placeholder="Short bio (optional)"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </Box>
                            <Button type="submit">Complete Registration</Button>
                        </Flex>
                    </form>
                </Flex>
            </Card>
        </Flex>
    );
};

export default Register;