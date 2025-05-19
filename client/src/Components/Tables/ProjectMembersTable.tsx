import {
    flexRender,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Avatar, Box, Flex, Table } from '@radix-ui/themes'
import { User } from '@my-types/types';
import { useNavigate } from 'react-router';

interface ProjectMembersTableProps {
    data: {
        members: User[]
        manager: User
    }
}

const ProjectMembersTable = ({ data }: ProjectMembersTableProps) => {
    const { members, manager } = data;

    const navigate = useNavigate();


    const columnHelper = createColumnHelper<User>();
    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            cell: info => (
                <Flex align="center" gap="2">
                    <Avatar
                        size="2"
                        radius="full"
                        fallback={info.row.original.name?.[0] || '?'}
                    />
                    {
                        info.getValue() + " " + info.row.original.surname
                    }
                </Flex>
            ),
            header: "Member"
        }),
        columnHelper.accessor("email", {
            id: "email",
            cell: info => info.getValue(),
            header: "Email"
        }),
        columnHelper.accessor("phoneNumber", {
            id: "phoneNumber",
            cell: info => info.getValue(),
            header: "Phone Number"
        }),
        columnHelper.accessor("role", {
            id: "role",
            cell: info => info.getValue(),
            header: "Role"
        })
    ];

    const table = useReactTable({
        data: members,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

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
                        <Table.Row
                            key={row.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${row.original.id}`)}
                        >
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