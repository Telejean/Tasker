import { Box, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { IconContext } from "react-icons";
import * as LuIcons from "react-icons/lu";
import s from "./ProjectCard.module.css";

export const ProjectCard = ({ projectName, noTasks, iconName }) => {
    const IconComponent = LuIcons[iconName] || LuIcons.LuCircleX;

    return (
        <Box>
            <Card size='2' variant='' className={s.projectCardContainer} style={{height:"100%"}}>
                <Flex gap='4' height={"100%"} align='center' >
                    <Box width={"fit-content"}>
                        <IconContext.Provider value={{ size: "3em" }}>
                            <IconComponent />
                        </IconContext.Provider>
                    </Box>

                    <Box>
                        <Text size="3" weight={"bold"}> {projectName} </Text>
                        <Separator orientation="horizontal" size="4" />
                        <Text>Tasks due soon: {noTasks}</Text>
                    </Box>
                </Flex>
            </Card>
        </Box>
    );
};
