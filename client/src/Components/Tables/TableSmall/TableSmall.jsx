import {
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import s from "./Table.module.css"
import { Box, Table } from '@radix-ui/themes'

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
    <Box className={s.tableSmallContainer}>
      <Table.Root className={s.tableSmall}>
        <Table.Header>
          <Table.Row key={"0"} className={s.tableSmallHeader}>
            {
              headers.map(header => (
                <Table.ColumnHeaderCell key={header.id}>{header.column.columnDef.header}</Table.ColumnHeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map(row => (
            <Table.Row key={row.id} className={s.tableSmallRow}>
              {row.getVisibleCells().map(cell => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>

  )
}

export default TableSmall