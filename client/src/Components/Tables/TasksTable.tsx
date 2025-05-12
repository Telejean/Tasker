import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    getExpandedRowModel,
    SortingState,
    getSortedRowModel
} from '@tanstack/react-table'
import { Avatar, Box, Flex, Table } from '@radix-ui/themes'
import { Task } from '@/types';
import { useState } from 'react';
import TaskDetailDialog from '@/Components/TaskDetailDialog/TaskDetailDialog';
import { tasksAtom } from '@/Pages/Tasks/Tasks';
import { useAtom } from 'jotai';
import "./table.css"

const TasksTable = ({ data }: { data: Task[] }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [, setTasks] = useAtom(tasksAtom);


    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(prev => {
            const updatedTasks = prev.map(task => {
                if (task.id === updatedTask.id) {
                    return { ...task, ...updatedTask };
                }
                return task;
            });
            return updatedTasks;
        });
    }

    const columnHelper = createColumnHelper<Task>()
    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            cell: info => info.getValue(),
            header: "Task name"
        }),
        columnHelper.accessor("deadline", {
            id: "deadline",
            cell: info => info.getValue().toString(),
            sortingFn: (rowA, rowB) => {
                const dateA = rowA.original.deadline.toDate("Europe/Bucharest");
                const dateB = rowB.original.deadline.toDate("Europe/Bucharest");

                return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
            },
            header: "Deadline",
        }),
        columnHelper.accessor("assignedPeople", {
            id: "assignedPeople",
            cell: info => (
                <Flex gap='1'>
                    {info.getValue().slice(0, 3).map((collaborator: string, i: number) => (
                        <Avatar
                            key={i}
                            size='1'
                            fallback={collaborator.charAt(0)}
                            radius='full'
                            title={collaborator}
                        />
                    ))}
                </Flex>
            ),
            header: "Collaborators"
        }),
        columnHelper.accessor("projectName", {
            id: "projectName",
            cell: info => info.getValue(),
            header: "Project"
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const headerGroups = table.getHeaderGroups();
    const headers = headerGroups[0].headers

    return (
        <>
            <Table.Root variant='surface'>
                <Table.Header>
                    <Table.Row key={"0"}>
                        {headers.map(header => (
                            <Table.ColumnHeaderCell
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                style={{ cursor: 'pointer' }}
                            >
                                <Flex align="center" gap="2">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    {{
                                        asc: ' ↑',
                                        desc: ' ↓',
                                    }[header.column.getIsSorted() as string] ?? null}
                                </Flex>
                            </Table.ColumnHeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <Table.Row key={row.id} onClick={() => {
                            console.log(row.original)
                            setSelectedTask(row.original);
                            setIsDetailDialogOpen(true);
                        }}>
                            {row.getVisibleCells().map(cell => (
                                <Table.Cell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {selectedTask && (
                <TaskDetailDialog
                    task={selectedTask}
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    onTaskUpdate={handleTaskUpdate}
                />
            )}
        </>
    )
}

export default TasksTable
