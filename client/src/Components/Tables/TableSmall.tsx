import {
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import "./table.css"
import { Box, Table } from '@radix-ui/themes'
import { Task } from '@my-types/types';

const TableSmall = ({ data }: { data: Task[] }) => {



  const columnHelper = createColumnHelper<Task>()
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      cell: info => info.getValue(),
      header: "Task Name"
    }),
    columnHelper.accessor("projectName", {
      id: "projectName",
      cell: info => info.getValue(),
      header: "Project Name"
    }),
    columnHelper.accessor("deadline", {
      id: "deadline",
      cell: info => info.getValue().toString(),
      header: "Deadline"
    }),
    columnHelper.accessor("description", {
      id: "description",
      cell: info => info.getValue(),
      header: "Description"
    }),
    columnHelper.accessor("assignedPeople", {
      id: "assignedPeople",
      cell: info => info.getValue(),
      header: "Assigned People"
    }),
    columnHelper.accessor("status", {
      id: "status",
      cell: info => info.getValue(),
      header: "Status"
    }),
    columnHelper.accessor("priority", {
      id: "priority",
      cell: info => info.getValue(),
      header: "Priority"
    })
  ]

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  const headerGroups = table.getHeaderGroups();
  const headers = headerGroups[0].headers

  return (
    <Box >
      <Table.Root >
        <Table.Header>
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
    </Box>

  )
}

export default TableSmall