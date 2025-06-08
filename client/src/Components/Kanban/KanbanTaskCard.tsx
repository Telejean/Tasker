import { Card, Flex, Text, Avatar, Heading, Badge, Box } from '@radix-ui/themes';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@my-types/types';

const KanbanTaskCard = ({ task, onTaskClick } : {task:Task, onTaskClick: (task: Task) => void}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: task.id });

    const deadlineDate = new Date(task.deadline.toString());
    const formattedDate = format(deadlineDate, 'MMM d, yyyy');

    const getBadgeColor = (status: Task['status']) => {
        switch (status) {
            case 'NOT_STARTED': return 'amber';
            case 'IN_PROGRESS': return 'blue';
            case 'COMPLETED': return 'green';
            default: return 'gray';
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab'
    };

    const handleCardClick = (e:any) => {
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
                        <Badge color={getBadgeColor(task.status)}>{task.status.toLowerCase()}</Badge>
                        <Text size="1">Due: {formattedDate}</Text>
                    </Flex>

                    <Text size="1" weight="bold" mb="1">Project: {task.project.name}</Text>

                    {task.assignedUsers && task.assignedUsers.length > 0 && (
                        <Box>
                            <Text size="1" weight="bold" mb="1">Collaborators:</Text>
                            <Flex gap="1" wrap="wrap">
                                {task.assignedUsers.slice(0, 3).map((member, i) => (
                                    <Avatar
                                        key={i}
                                        size="1"
                                        fallback={member.name.charAt(0)}
                                        radius="full"
                                        title={member.name + " " + member.surname}
                                    />
                                ))}
                                {task.assignedUsers.length > 3 && (
                                    <Badge variant="soft">
                                        +{task.assignedUsers.length - 3}
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