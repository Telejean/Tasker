import { Box, Heading, ScrollArea, Flex } from '@radix-ui/themes';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanTaskCard from './KanbanTaskCard';

// Column component for each status
const KanbanColumn = ({ id, title, tasks, onTaskClick }) => {
    return (
        <Box width="100%" maxWidth="350px">
            <Heading as="h3" size="3" mb="2">{title}</Heading>
            <Box
                height="100%"
                style={{
                    minHeight: '400px',
                    backgroundColor: 'var(--gray-3)',
                    borderRadius: 'var(--radius-3)',
                    padding: 'var(--space-3)'
                }}
            >
                <ScrollArea style={{ height: '100%' }}>
                    <SortableContext
                        items={tasks.map(task => task.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <Flex direction="column" gap="2">
                            {tasks.map((task) => (
                                <KanbanTaskCard
                                    key={task.id}
                                    task={task}
                                    onTaskClick={onTaskClick}
                                />
                            ))}
                        </Flex>
                    </SortableContext>
                </ScrollArea>
            </Box>
        </Box>
    );
};

export default KanbanColumn;