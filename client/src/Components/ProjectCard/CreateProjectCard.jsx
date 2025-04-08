import { LuBadgePlus } from "react-icons/lu";
import s from "./ProjectCard.module.css"
import { Box, Card, Flex, Text } from "@radix-ui/themes";
const CreateProjectCard = () => {
    return (
        <Box >
            <Card className={s.projectCardContainer} style={{height:"100%"}}>
                <Flex direction='column' align='center' justify='center' height={"100%"}>
                    <LuBadgePlus size={"4em"} color="black" />
                    <Box>
                        <Text>Create a new project</Text>
                    </Box>
                </Flex>
            </Card>
        </Box>
    )
}

export default CreateProjectCard
