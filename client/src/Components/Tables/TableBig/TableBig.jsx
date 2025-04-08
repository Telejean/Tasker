import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import ProgressBar from '../../ProgressBar/ProgressBar'
import s from "./TableBig.module.css"



const TableBig = ({ data }) => {

    const columnHelper = createColumnHelper()
    const columns= [
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
        <table className={s.tableBig}>
            <thead className={s.tableBigHeader}>
                <tr key={"0"}>
                    {
                        headers.map(header => (
                            <th className={s.tableBigHeaderCell} key={header.id}>{header.column.columnDef.header}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody className={s.tableBigBody}>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={s.tableBigRow}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>

    )
}

export default TableBig