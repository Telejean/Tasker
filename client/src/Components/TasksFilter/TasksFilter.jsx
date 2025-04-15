import { Box, Button, CheckboxGroup, DropdownMenu } from '@radix-ui/themes';
import { LuListFilter } from 'react-icons/lu';
import CalendarRangePicker from '../DateRangePicker/CalendarRangePicker';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { filtersAtom } from '../../Pages/Tasks/Tasks'; 

const TasksFilter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [statusValues, setStatusValues] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [, setFilters] = useAtom(filtersAtom); // Use the filtersAtom

    // Update the filters atom whenever statusValues or selectedDate changes
    useEffect(() => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            status: statusValues,
            deadline: selectedDate,
        }));
    }, [statusValues, selectedDate, setFilters]);

    // Handler for checkbox changes
    const handleStatusChange = (values) => {
        setStatusValues(values);
    };

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger>
                <Button variant="soft" className="radix-dropdown-trigger">
                    <LuListFilter />
                    Filter
                    {statusValues.length > 0 && (
                        <span className="filter-badge">{statusValues.length}</span>
                    )}
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
                        <CalendarRangePicker value={selectedDate} onChange={setSelectedDate} />
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>
                        Status
                        {statusValues.length > 0 && (
                            <span className="filter-badge">{statusValues.length}</span>
                        )}
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        <CheckboxGroup.Root
                            value={statusValues}
                            onValueChange={handleStatusChange}
                            name="status-filters"
                        >
                            <CheckboxGroup.Item value="completed">Completed</CheckboxGroup.Item>
                            <CheckboxGroup.Item value="in-progress">In progress</CheckboxGroup.Item>
                            <CheckboxGroup.Item value="not-started">Not started</CheckboxGroup.Item>
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