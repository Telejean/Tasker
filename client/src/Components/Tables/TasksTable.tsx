import {
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Avatar, Badge, Box, Flex, Table } from "@radix-ui/themes";
import { Task, User } from "@my-types/types";
import { useState } from "react";
import TaskDetailDialog from "@/Components/TaskDetailDialog/TaskDetailDialog";
import { tasksAtom } from "@/Pages/Tasks/Tasks";
import { useAtom } from "jotai";
import "./table.css";
import { taskService } from "@/services/task.service";
import { useNavigate } from "react-router";

const TasksTable = ({ data }: { data: Task[] }) => {

  console.log("TasksTable data", data);

  const getBadgeColor = (status: Task['status']) => {
    switch (status) {
      case 'NOT_STARTED': return 'amber';
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETED': return 'green';
      default: return 'gray';
    }
  }
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'red';
      default: return 'gray';
    }
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [, setTasks] = useAtom(tasksAtom);

  const navigate = useNavigate();


  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const response = await taskService.updateTask(updatedTask.id, updatedTask)
      setTasks((prev) => {
        const updatedTasks = prev.map((task) => {
          if (task.id === updatedTask.id) {
            return { ...task, ...updatedTask };
          }
          return task;
        });
        return updatedTasks;
      });
    } catch (error) {
      console.error("Error updating task:", error);
      return;
    }
  };

  const columnHelper = createColumnHelper<Task>();
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      cell: (info) => info.getValue(),
      header: "Task name",
    }),
    columnHelper.accessor("deadline", {
      id: "deadline",
      cell: (info) => info.getValue().toLocaleDateString('ro-RO'),
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.deadline;
        const dateB = rowB.original.deadline;

        return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
      },
      header: "Deadline",
    }),
    columnHelper.accessor("assignedUsers", {
      id: "assignedUsers",
      cell: (info) => (
        <Flex gap="1">
          {info
            ?.getValue()
            ?.slice(0, 3)
            .map((member: User, i: number) => (
              <Avatar
                key={i}
                size="1"
                fallback={member.name.charAt(0)}
                radius="full"
                title={member.name}
              />
            ))}
        </Flex>
      ),
      header: "Collaborators",
    }),
    columnHelper.accessor("project", {
      id: "project",
      cell: (info) => info.getValue().name,
      header: "Project",
    }),
    columnHelper.accessor("status", {
      id: "status",
      cell: (info) => <Badge color={getBadgeColor(info.getValue())}>{info.getValue().toLowerCase()}</Badge>,
      header: "Status",
    }),
    columnHelper.accessor("priority", {
      id: "priority",
      cell: (info) => <Badge color={getPriorityColor(info.getValue())}>{info.getValue().toLowerCase()}</Badge>,
      header: "Priority",
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const headers = headerGroups[0].headers;

  return (
    <>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row key={"0"}>
            {headers.map((header) => (
              <Table.ColumnHeaderCell
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                style={{ cursor: "pointer" }}
              >
                <Flex align="center" gap="2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  {{
                    asc: " ↑",
                    desc: " ↓",
                  }[header.column.getIsSorted() as string] ?? null}
                </Flex>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              onClick={() => {
                setSelectedTask(row.original);
                navigate(`/tasks/${row.original.id}`)
              }}
            >
              {row.getVisibleCells().map((cell) => (
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
  );
};

export default TasksTable;
