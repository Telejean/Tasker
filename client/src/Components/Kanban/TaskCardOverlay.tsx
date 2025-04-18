import { Card, Flex, Text, Heading, Badge, Box } from '@radix-ui/themes';
import { format } from 'date-fns';

// Non-sortable task card for the overlay
const TaskCardOverlay = ({ task }) => {
    // Format the deadline date
    const deadlineDate = new Date(task.deadline);
    const formattedDate = format(deadlineDate, 'MMM d, yyyy');

    // Determine badge color based on status
    const getBadgeColor = (status) => {
        switch (status) {
            case 'not-started': return 'amber';
            case 'in-progress': return 'blue';
            case 'completed': return 'green';
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