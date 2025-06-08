import { act, useEffect, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    UniqueIdentifier
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import KanbanColumn from './KanbanColumn';
import TaskCardOverlay from './TaskCardOverlay';
import TaskDetailDialog from '../TaskDetailDialog/TaskDetailDialog';
import { useAtom } from 'jotai';
import { tasksAtom } from '../../Pages/Tasks/Tasks';
import { Task } from '@my-types/types';

const Kanban = ({ tasks } : {tasks:Task[]}) => {
    const [columns, setColumns] = useState({
        'NOT_STARTED': {
            title: 'Not Started',
            items: tasks.filter(task => task.status === 'NOT_STARTED')
        },
        'IN_PROGRESS': {
            title: 'In Progress',
            items: tasks.filter(task => task.status === 'IN_PROGRESS')
        },
        'COMPLETED': {
            title: 'Completed',
            items: tasks.filter(task => task.status === 'COMPLETED')
        }
    });

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [, setTasks] = useAtom(tasksAtom);


    useEffect(() => {
        setColumns({
            'NOT_STARTED': {
                title: 'Not Started',
                items: tasks.filter(task => task.status === 'NOT_STARTED')
            },
            'IN_PROGRESS': {
                title: 'In Progress',
                items: tasks.filter(task => task.status === 'IN_PROGRESS')
            },
            'COMPLETED': {
                title: 'Completed',
                items: tasks.filter(task => task.status === 'COMPLETED')
            }
        });
    }, [tasks])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, 
            },
        }), 
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: UniqueIdentifier) => {
        if (id in columns) {
            return id;
        }

        for (const [columnId, column] of Object.entries(columns)) {
            const taskIndex = column.items.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
                return columnId;
            }
        }

        return null;
    };

    const findTask = (id: UniqueIdentifier) => {
            for (const column of Object.values(columns)) {
                const task = column.items.find(task => task.id === id);
                if (task) {
                    return task;
                }
            }
            return null;
        };

    const handleDragStart = (event : DragStartEvent) => {
        const { active } = event;
        const task = findTask(active.id);
        setActiveTask(task);
    };

    const handleDragOver = (event : DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;


        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setColumns(prev => {
            const activeItems = [...prev[activeContainer].items];
            const overItems = [...prev[overContainer].items];

            const activeIndex = activeItems.findIndex(
                item => item.id === activeId
            );

            if (activeIndex === -1) {
                return prev;
            }

            const [removedItem] = activeItems.splice(activeIndex, 1);

            const updatedTask = {
                ...removedItem,
                status: overContainer
            };

            overItems.push(updatedTask);

            return {
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    items: activeItems
                },
                [overContainer]: {
                    ...prev[overContainer],
                    items: overItems
                }
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        const activeIndex = columns[activeContainer].items.findIndex(
            item => item.id === activeId
        );
        const overIndex = columns[overContainer].items.findIndex(
            item => item.id === overId
        );

        if (activeIndex !== overIndex) {
            setColumns(prev => ({
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    items: arrayMove(
                        prev[activeContainer].items,
                        activeIndex,
                        overIndex
                    )
                }
            }));
        }
    };

    const handleTaskClick = (task:Task) => {
        setSelectedTask(task);
        setIsDetailDialogOpen(true);
    };

    const handleTaskUpdate = (updatedTask : Task) => {
        setTasks(prev => {
            const updatedTasks = prev.map(task => {
                if (task.id === updatedTask.id) {
                    return { ...task, ...updatedTask };
                }
                return task;
            });
            return updatedTasks;
        });

        setColumns(prev => {
            let currentColumnId = null;
            for (const [columnId, column] of Object.entries(prev)) {
                if (column.items.some(item => item.id === updatedTask.id)) {
                    currentColumnId = columnId;
                    break;
                }
            }

            if (!currentColumnId) return prev;

            if (currentColumnId !== updatedTask.status) {
                const sourceItems = prev[currentColumnId].items.filter(
                    item => item.id !== updatedTask.id
                );

                const destinationItems = [...prev[updatedTask.status].items, updatedTask];

                return {
                    ...prev,
                    [currentColumnId]: {
                        ...prev[currentColumnId],
                        items: sourceItems
                    },
                    [updatedTask.status]: {
                        ...prev[updatedTask.status],
                        items: destinationItems
                    }
                };
            }

            return {
                ...prev,
                [currentColumnId]: {
                    ...prev[currentColumnId],
                    items: prev[currentColumnId].items.map(item =>
                        item.id === updatedTask.id ? updatedTask : item
                    )
                }
            };
        });
    };

    return (
        <Box overflowX='scroll' height='fitContent' overflowY='hidden'>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Flex gap="4" p='4' justify='center'>
                    {Object.entries(columns).map(([columnId, column]) => (
                        <KanbanColumn
                            key={columnId}
                            title={column.title}
                            tasks={column.items}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </Flex>
                <DragOverlay>
                    {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            {selectedTask && (
                <TaskDetailDialog
                    task={selectedTask}
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    onTaskUpdate={handleTaskUpdate}
                />
            )}
        </Box>
    );
};

export default Kanban;