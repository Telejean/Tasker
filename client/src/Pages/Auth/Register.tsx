import { Box, Button, Card, Flex, Heading, Text, TextArea, TextField } from "@radix-ui/themes";
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../App";

const Register = () => {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState(searchParams.get("name") || "");
    const [surname, setSurname] = useState(searchParams.get("surname") || "");
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [, setUser] = useAtom(userAtom);

    // Redirect to login if no email in params (means they didn't come from Google OAuth)
    useEffect(() => {
        if (!searchParams.get("email")) {
            console.log("Navigaaaaaaaaaaaaaaam")
            // navigate('/login');
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3000/api/auth/complete-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ name, surname, email, bio }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Set user in global state and redirect to home
            setUser(data.user);
            // navigate("/home");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
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