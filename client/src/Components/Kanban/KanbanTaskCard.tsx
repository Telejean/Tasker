import { Card, Flex, Text, Avatar, Heading, Badge, Box } from '@radix-ui/themes';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Task card component (sortable)
const KanbanTaskCard = ({ task, onTaskClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: task.id });

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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab'
    };

    const handleCardClick = (e) => {
        // Prevent triggering drag when clicking to view details
        if (e.target.closest('.card-content')) {
            onTaskClick(task);
            e.stopPropagation();
        }
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleCardClick}
        >
            <div className="card-content">
                <Flex direction="column" gap="2">
                    <Heading as="h4" size="2">{task.name}</Heading>
                    <Text size="1" color="gray">{task.description}</Text>

                    <Flex justify="between" align="center">
                        <Badge color={getBadgeColor(task.status)}>{task.status}</Badge>
                        <Text size="1">Due: {formattedDate}</Text>
                    </Flex>

                    <Text size="1" weight="bold" mb="1">Project: {task.projectName}</Text>

                    {task.assignedPeople && task.assignedPeople.length > 0 && (
                        <Box>
                            <Text size="1" weight="bold" mb="1">Collaborators:</Text>
                            <Flex gap="1" wrap="wrap">
                                {task.assignedPeople.slice(0, 3).map((collaborator, i) => (
                                    <Avatar
                                        key={i}
                                        size="1"
                                        fallback={collaborator.charAt(0)}
                                        radius="full"
                                        title={collaborator}
                                    />
                                ))}
                                {task.assignedPeople.length > 3 && (
                                    <Badge variant="soft">
                                        +{task.assignedPeople.length - 3}
                                    </Badge>
                                )}
                            </Flex>
                        </Box>
                    )}
                </Flex>
            </div>
        </Card>
    );
};

export default KanbanTaskCard;