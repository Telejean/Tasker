import { flexRender, createColumnHelper, getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from '@tanstack/react-table'
import { Avatar, Box, Flex, Table, Progress, Badge, Text } from '@radix-ui/themes'
import { useState } from 'react'
import * as Icons from "react-icons/lu";
import ProjectActions from './ProjectActions'
import { useNavigate } from 'react-router-dom';
import "./table.css"
import { Project } from '@my-types/types';

const ProjectsTable = ({ data }: { data: Project[] }) => {

    console.log("ProjectsTable data:", data);   

    const [sorting, setSorting] = useState<SortingState>([])
    const navigate = useNavigate();


    const handleRowClick = (projectId: number, event: React.MouseEvent) => {
        if ((event.target as HTMLElement).closest('[data-action-button]')) {
            return;
        }
        navigate(`/projects/${projectId}`);
    };

    const handleCopyLink = (id: number) => {
        const projectUrl = `${window.location.origin}/projects/${id}`;
        navigator.clipboard.writeText(projectUrl);
    };

    const handleArchive = (id: number) => {
        console.log('Archive project:', id);
    };

    const handleDelete = (id: number) => {
        console.log('Delete project:', id);
    };


    const columnHelper = createColumnHelper<Project>()
    const columns = [
        columnHelper.accessor("icon", {
            id: "icon",
            cell: info => {
                const IconComponent = Icons[info.getValue() as keyof typeof Icons] || Icons.LuFile;
                return <IconComponent />;
            },
            header: ""
        }),
        columnHelper.accessor("name", {
            id: "name",
            cell: info => (<Text weight='bold' size='3'>{info.getValue()}</Text>),
            header: "Project Name"
        }),
        columnHelper.accessor("members", {
            id: "members",
            cell: info => (
                <Flex gap="1" wrap="wrap" align='center'>
                    {info.getValue().slice(0, 3).map((member, index) => (
                        <Avatar
                            key={index}
                            size="1"
                            radius="full"
                            fallback={member.name.charAt(0)}
                        />
                    ))}
                    {info.getValue().length > 3 && (
                        <Badge variant="soft">
                            +{info.getValue().length - 3}
                        </Badge>
                    )}
                </Flex>
            ),
            header: "Members"
        }),
        columnHelper.accessor("manager", {
            id: "manager",
            cell: info => (
                <Flex align="center" gap="2">
                    <Avatar
                        size="1"
                        radius="full"
                        fallback={info.getValue().name.slice(0, 1)}
                    />
                    {info.getValue().name + " " + info.getValue().surname}
                </Flex>
            ),
            header: "Manager"
        }),
        columnHelper.accessor("completion", {
            id: "completion",
            cell: info => (
                <Progress value={info.getValue() * 100} />
            ),
            header: "Progress"
        }),
        columnHelper.accessor("status", {
            id: "status",
            cell: info => (
                <span>{info.getValue()}</span>
            ),
            header: "Status"
        }),
        columnHelper.accessor("id", {
            id: "actions",
            header: "Actions",
            cell: info => (
                <ProjectActions
                    projectId={info.getValue()}
                    onCopyLink={handleCopyLink}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                />
            )
        })
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })

    return (
        <Box width="100%">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        {table.getHeaderGroups()[0].headers.map(header => (
                            <Table.ColumnHeaderCell
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                style={{ cursor: 'pointer' }}
                            >
                                <Flex align="center" gap="2">
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    {{
                                        asc: ' ↑',
                                        desc: ' ↓',
                                    }[header.column.getIsSorted() as string] ?? null}
                                </Flex>
                            </Table.ColumnHeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <Table.Row
                            key={row.id}
                            onClick={(e) => handleRowClick(row.original.id, e)}
                            style={{ cursor: 'pointer' }}
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

export default ProjectsTable