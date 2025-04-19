import { Button, DropdownMenu } from '@radix-ui/themes';
import { sortAtom } from "@/Pages/Tasks/Tasks";
import { useAtom } from 'jotai';
import { LuArrowUpDown } from 'react-icons/lu';


const TasksSort = () => {
    const [, setSort] = useAtom(sortAtom);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button>
                    <LuArrowUpDown />
                    Sort
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Name</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'name', direction: 'asc' })}>
                            Ascending
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'name', direction: 'desc' })}>
                            Descending
                        </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Deadline</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'deadline', direction: 'asc' })}>
                            Ascending
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'deadline', direction: 'desc' })}>
                            Descending
                        </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Priority</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'priority', direction: 'asc' })}>
                            Low to High
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setSort({ field: 'priority', direction: 'desc' })}>
                            High to Low
                        </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}

export default TasksSort;