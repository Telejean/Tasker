import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    getExpandedRowModel,
} from '@tanstack/react-table'




export const TasksTable = ({ data }) => {

    const columnHelper = createColumnHelper()
    const columns = [
        columnHelper.accessor("task_name", {
            id: "task_name",
            cell: info => info.getValue(),
            header: "Task name"
        }),
        columnHelper.accessor("deadline", {
            id: "deadline",
            cell: info => info.getValue(),
            header: "Deadline"
        }),
        columnHelper.accessor("collaborators", {
            id: "collaborators",
            cell: info => info.getValue().map(name =>
                name.split(' ').map(part => part[0]).join('')
            ).join(', '),
            header: "Collaborators"
        }),
        columnHelper.accessor("project", {
            id: "project",
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

    return (
        <table>
            <thead>
                <tr>
                    {
                        table.getHeaderGroups()[0].headers.map(header => (
                            <th key={header.id}>{header.column.columnDef.header}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {
                                row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}
