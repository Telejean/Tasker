import {
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import s from "./Table.module.css"

const TableSmall = ({ data, columnsName }) => {

  const columnHelper = createColumnHelper()
  const columnsParsed = []
  columnsName.forEach((column) => {
    columnsParsed.push(columnHelper.accessor(column.accesor, {
      id: column.accesor,
      cell: info => info.getValue(),
      header: column.displayName
    }))
  })


  const table = useReactTable({ data, columns: columnsParsed, getCoreRowModel: getCoreRowModel() })

  const headerGroups = table.getHeaderGroups();
  const headers = headerGroups[0].headers

  return (
    <div className={s.tableSmallContainer}>
      <table className={s.tableSmall}>
        <thead>
          <tr key={"0"} className={s.tableSmallHeader}>
            {
              headers.map(header => (
                <th key={header.id}>{header.column.columnDef.header}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={s.tableSmallRow}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )
}

export default TableSmall