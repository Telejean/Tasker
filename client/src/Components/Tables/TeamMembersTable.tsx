import React, { useMemo } from 'react';
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
    const data: TeamMember[] = useMemo(
        () =>
            projectManager
                ? [{ ...projectManager, role: 'PROJECT MANAGER' }, ...teamMembers]
                : teamMembers,
        [teamMembers, projectManager]
    );


    const columnHelper = useMemo(() => createColumnHelper<TeamMember>(), []);
    const columns = useMemo(
        () => [
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
                header: "Member",
            }),
            columnHelper.accessor("role", {
                id: "role",
                cell: info => info.getValue(),
                header: "Role",
            }),
        ],
        [columnHelper]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const headerGroups = table.getHeaderGroups();
    const headers = headerGroups[0].headers


    return (
        <Table.Root size="2">
            <Table.Header>
                <Table.Row key={"0"}>
                    {headers.map(header => (
                        <Table.ColumnHeaderCell key={header.id}>
                            {header.isPlaceholder ? null : flexRender(
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
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export default TeamMembersTable
