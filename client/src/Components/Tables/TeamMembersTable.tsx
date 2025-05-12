import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Avatar, Box, Flex, Table } from '@radix-ui/themes'

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface TeamMembersTableProps {
    teamMembers: TeamMember[];
    projectManager?: TeamMember;
}

const TeamMembersTable = ({ teamMembers, projectManager }: TeamMembersTableProps) => {
    // Combine all members including the manager if provided
    const data: TeamMember[] = projectManager
        ? [{ ...projectManager, role: 'PROJECT MANAGER' }, ...teamMembers]
        : teamMembers;

    const columnHelper = createColumnHelper<TeamMember>()
    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            cell: info => (
                <Flex align="center" gap="2">
                    <Avatar
                        size="2"
                        src={info.row.original.avatar}
                        fallback={info.getValue().charAt(0).toUpperCase()}
                        color="indigo"
                    />
                    <Box>
                        <div>{info.getValue()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-11)' }}>{info.row.original.email}</div>
                    </Box>
                </Flex>
            ),
            header: () => "Member",
        }),
        columnHelper.accessor("role", {
            id: "role",
            cell: info => info.getValue(),
            header: () => "Role",
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Box style={{ overflowX: 'auto' }}>
            <Table size="2">
                <Table.Header>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Row key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Table.ColumnHeaderCell key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </Table.ColumnHeaderCell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <Table.Row key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <Table.Cell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Box>
    )
}

export default TeamMembersTable
