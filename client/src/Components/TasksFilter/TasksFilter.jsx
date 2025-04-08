import { Box, Button, DropdownMenu } from '@radix-ui/themes';
import { LuListFilter } from 'react-icons/lu';
import CalendarRangePicker from '../DateRangePicker/CalendarRangePicker';
import { useState } from 'react';

const TasksFilter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);


    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger>
                <Button variant="soft" className="radix-dropdown-trigger">
                    <LuListFilter />
                    Filter
                    <DropdownMenu.TriggerIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content 
                modal={false}
                onPointerDownOutside={(event) => {
                    // Prevent closing if calendar is open and click is inside it
                    if (isCalendarOpen && event.target.closest('.calendar-range-picker')) {
                        event.preventDefault();
                    }
                }}
                onInteractOutside={(event) => {
                    // Prevent closing if calendar is open and interaction is inside it
                    if (isCalendarOpen && event.target.closest('.calendar-range-picker')) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={() => {
                    // Close calendar first on Escape, then dropdown on second Escape
                    if (isCalendarOpen) {
                        setIsCalendarOpen(false);
                        // Prevent dropdown from closing
                        event.preventDefault();
                    }
                }}
            >
                <DropdownMenu.Sub open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DropdownMenu.SubTrigger>Deadline</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                            <CalendarRangePicker />
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Status</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        <DropdownMenu.Item>Completed</DropdownMenu.Item>
                        <DropdownMenu.Item>In progress</DropdownMenu.Item>
                        <DropdownMenu.Item>Not started</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Item>Assignee</DropdownMenu.Item>
                <DropdownMenu.Item>Project</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default TasksFilter;