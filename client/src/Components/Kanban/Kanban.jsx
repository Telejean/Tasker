import { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import KanbanColumn from './KanbanColumn';
import TaskCardOverlay from './TaskCardOverlay';
import TaskDetailDialog from '../TaskDetailDialog/TaskDetailDialog';
import { useAtom } from 'jotai';
import { tasksAtom } from '../../Pages/Tasks/Tasks';

const Kanban = ({ tasks }) => {
    const [columns, setColumns] = useState({
        'not-started': {
            title: 'Not Started',
            items: tasks.filter(task => task.status === 'not-started')
        },
        'in-progress': {
            title: 'In Progress',
            items: tasks.filter(task => task.status === 'in-progress')
        },
        'completed': {
            title: 'Completed',
            items: tasks.filter(task => task.status === 'completed')
        }
    });

    const [activeTask, setActiveTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [, setTasks] = useAtom(tasksAtom);

    useEffect(() => {   
        console.log(selectedTask)
    }, [selectedTask]);

    useEffect(() => {
        console.log(tasks)
        setColumns({
            'not-started': {
                title: 'Not Started',
                items: tasks.filter(task => task.status === 'not-started')
            },
            'in-progress': {
                title: 'In Progress',
                items: tasks.filter(task => task.status === 'in-progress')
            },
            'completed': {
                title: 'Completed',
                items: tasks.filter(task => task.status === 'completed')
            }
        });
    },[tasks])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Prevent drag operations when clicking on task card content
            activationConstraint: {
                distance: 8, // Require 8px of movement before activating drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id) => {
        if (id in columns) {
            return id;
        }

        for (const [columnId, column] of Object.entries(columns)) {
            const taskIndex = column.items.findIndex(task => task.task_name === id);
            if (taskIndex !== -1) {
                return columnId;
            }
        }

        return null;
    };

    const findTask = (id) => {
        for (const column of Object.values(columns)) {
            const task = column.items.find(task => task.task_name === id);
            if (task) {
                return task;
            }
        }
        return null;
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const task = findTask(active.id);
        setActiveTask(task);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers
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

            // Find the task index in the active container
            const activeIndex = activeItems.findIndex(
                item => item.task_name === activeId
            );

            if (activeIndex === -1) {
                return prev;
            }

            // Remove the task from the active container
            const [removedItem] = activeItems.splice(activeIndex, 1);

            // Update the task's status to match the new container
            const updatedTask = {
                ...removedItem,
                status: overContainer
            };

            // Add the task to the over container
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

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            // This is handled in handleDragOver for cross-container dragging
            return;
        }

        const activeIndex = columns[activeContainer].items.findIndex(
            item => item.task_name === activeId
        );
        const overIndex = columns[overContainer].items.findIndex(
            item => item.task_name === overId
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

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailDialogOpen(true);
    };

    const handleTaskUpdate = (updatedTask) => {
        setTasks(prev => {
            const updatedTasks = prev.map(task => {
                if (task.task_name === updatedTask.task_name) {
                    return { ...task, ...updatedTask };
                }
                return task;
            });
            return updatedTasks;
        });
        
        setColumns(prev => {
            let currentColumnId = null;
            for (const [columnId, column] of Object.entries(prev)) {
                if (column.items.some(item => item.task_name === updatedTask.task_name)) {
                    currentColumnId = columnId;
                    break;
                }
            }
    
            if (!currentColumnId) return prev;
    
            // If status has changed (column needs to change)
            if (currentColumnId !== updatedTask.status) {
                // Remove task from old column
                const sourceItems = prev[currentColumnId].items.filter(
                    item => item.task_name !== updatedTask.task_name
                );
    
                // Add task to new column
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
    
            // If status hasn't changed, just update the task in its current column
            return {
                ...prev,
                [currentColumnId]: {
                    ...prev[currentColumnId],
                    items: prev[currentColumnId].items.map(item =>
                        item.task_name === updatedTask.task_name ? updatedTask : item
                    )
                }
            };
        });
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Flex gap="4" width="100%" style={{ overflowX: 'auto', padding: 'var(--space-4)' }}>
                    {Object.entries(columns).map(([columnId, column]) => (
                        <KanbanColumn
                            key={columnId}
                            id={columnId}
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
        </>
    );
};

export default Kanban;