import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Avatar, Box, Flex, Table } from '@radix-ui/themes'

interface ProjectMember {
    name: string;
    role: 'manager' | 'member';
    avatar?: string;
}

interface ProjectMembersTableProps {
    members: string[];
    manager: string;
}

const ProjectMembersTable = ({ members, manager }: ProjectMembersTableProps) => {
    const data: ProjectMember[] = [
        { name: manager, role: 'manager' },
        ...members.map(member => ({ name: member, role: 'member' as const }))
    ]

    const columnHelper = createColumnHelper<ProjectMember>()
    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            cell: info => (
                <Flex align="center" gap="2">
                    <Avatar 
                        size="2" 
                        radius="full" 
                        fallback={info.getValue()[0]} 
                    />
                    {info.getValue()}
                </Flex>
            ),
            header: "Name"
        }),
        columnHelper.accessor("role", {
            id: "role",
            cell: info => info.getValue(),
            header: "Role"
        })
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Box>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        {table.getHeaderGroups()[0].headers.map(header => (
                            <Table.ColumnHeaderCell key={header.id}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </Table.ColumnHeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <Table.Row key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <Table.Cell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default ProjectMembersTable