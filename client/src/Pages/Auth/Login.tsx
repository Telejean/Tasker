import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { FcGoogle } from "react-icons/fc";
import { API_URL } from "../../config/api";

const Login = () => {
    return (
        <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
            <Card size="3" style={{ width: "400px" }}>
                <Flex direction="column" gap="4">
                    <Heading align="center" size="6">Welcome to Tasker</Heading>
                    <Text align="center" size="2">Sign in to continue</Text>

                    <Button
                        variant="soft"
                        size="3"
                        onClick={() => window.location.href = `${API_URL}/auth/google/jwt`}
                    >
                        <FcGoogle style={{ marginRight: 8 }} />
                        Continue with Google
                    </Button>
                </Flex>
            </Card>
        </Flex>
    );
};

export default Login;