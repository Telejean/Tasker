import { Box, Button, CheckboxGroup, DropdownMenu } from '@radix-ui/themes';
import { LuListFilter } from 'react-icons/lu';
import CalendarRangePicker from '../DateRangePicker/CalendarRangePicker';
import { useState } from 'react';
import { CheckboxItem } from '@radix-ui/themes/components/context-menu';

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
                    if (isCalendarOpen && event.target.closest('.calendar-range-picker')) {
                        event.preventDefault();
                    }
                }}
                onInteractOutside={(event) => {
                    if (isCalendarOpen && event.target.closest('.calendar-range-picker')) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (isCalendarOpen) {
                        setIsCalendarOpen(false);
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
                    <DropdownMenu.SubContent >
                        <CheckboxGroup.Root defaultValue={[]} name="example">
                            <CheckboxGroup.Item value="1">Fun</CheckboxGroup.Item>
                            <CheckboxGroup.Item value="2">Serious</CheckboxGroup.Item>
                            <CheckboxGroup.Item value="3">Smart</CheckboxGroup.Item>
                        </CheckboxGroup.Root>
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Item>Assignee</DropdownMenu.Item>
                <DropdownMenu.Item>Project</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default TasksFilter;