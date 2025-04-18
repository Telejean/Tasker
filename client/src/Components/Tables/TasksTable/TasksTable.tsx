import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    getExpandedRowModel,
} from '@tanstack/react-table'
import { Box, Table } from '@radix-ui/themes'
import { Task } from '@/types';


const TasksTable = ({ data }: { data: Task[] }) => {

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
            header: "Deadline"
        }),
        columnHelper.accessor("assignedPeople", {
            id: "assignedPeople",
            cell: info => info.getValue().map(name =>
                name.split(' ').map(part => part[0]).join('')
            ).join(', '),
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
        getRowCanExpand: (row) => true,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    })

    const headerGroups = table.getHeaderGroups();
    const headers = headerGroups[0].headers

    return (
        <Table.Root >
            <Table.Header >
                <Table.Row key={"0"}>
                    {
                        headers.map(header => (
                            <Table.ColumnHeaderCell key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </Table.ColumnHeaderCell>
                        ))
                    }
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {table.getRowModel().rows.map(row => (
                    <Table.Row key={row.id} >
                        {row.getVisibleCells().map(cell => (
                            <Table.Cell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export default TasksTable
