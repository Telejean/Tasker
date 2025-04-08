import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import ProgressBar from '../../ProgressBar/ProgressBar'
import s from "./TableBig.module.css"
import { Table } from '@radix-ui/themes'


const TableBig = ({ data }) => {

    const columnHelper = createColumnHelper()
    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            cell: info => info.getValue(),
            header: "Project Name"
        }),
        columnHelper.accessor("manager", {
            id: "manager",
            cell: info => info.getValue(),
            header: "Team Leader"
        }),
        columnHelper.accessor("completion", {
            id: "completion",
            cell: info => <ProgressBar progress={info.getValue()} />,
            header: "Completion"
        })
    ]

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

    const headerGroups = table.getHeaderGroups();
    const headers = headerGroups[0].headers

    return (
        <Table.Root >
            <Table.Header >
                <Table.Row key={"0"}>
                    {
                        headers.map(header => (
                            <th key={header.id}>{header.column.columnDef.header}</th>
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

export default TableBig