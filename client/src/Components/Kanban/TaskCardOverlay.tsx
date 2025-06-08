import { Card, Flex, Text, Heading, Badge, Box } from '@radix-ui/themes';
import { format } from 'date-fns';

const TaskCardOverlay = ({ task }) => {
    const deadlineDate = new Date(task.deadline);
    const formattedDate = format(deadlineDate, 'MMM d, yyyy');

    const getBadgeColor = (status) => {
        switch (status) {
            case 'NOT_STARTED': return 'amber';
            case 'IN_PROGRESS': return 'blue';
            case 'COMPLETED': return 'green';
            default: return 'gray';
        }
    };

    return (
        <Card style={{ opacity: 0.8, width: '300px' }}>
            <Flex direction="column" gap="2">
                <Heading as="h4" size="2">{task.name}</Heading>
                <Text size="1" color="gray">{task.description}</Text>

                <Flex justify="between" align="center">
                    <Badge color={getBadgeColor(task.status)}>{task.status}</Badge>
                    <Text size="1">Due: {formattedDate}</Text>
                </Flex>

                <Box>
                    <Text size="1" weight="bold" mb="1">Project: {task.projectName}</Text>
                    <Text size="1" weight="bold" mb="1">Assignee: {task.name}</Text>
                </Box>
            </Flex>
        </Card>
    );
};

export default TaskCardOverlay;