import {
  Box,
  Button,
  CheckboxGroup,
  Checkbox,
  DropdownMenu,
} from "@radix-ui/themes";
import { LuListFilter } from "react-icons/lu";
import CalendarRangePicker from "../DateRangePicker/CalendarRangePicker";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { filtersAtom } from "../../Pages/Tasks/Tasks";
import { parseDate } from "@internationalized/date";

const TasksFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [priorityValues, setPriorityValues] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [, setFilters] = useAtom(filtersAtom);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: statusValues,
      deadline: selectedDate ?? undefined,
      priority: priorityValues,
    }));
  }, [statusValues, selectedDate, priorityValues, setFilters]);

  const handleStatusChange = (values: string[]) => {
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
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (
            isCalendarOpen &&
            target &&
            target.closest(".calendar-range-picker")
          ) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (
            isCalendarOpen &&
            target &&
            target.closest(".calendar-range-picker")
          ) {
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
        <DropdownMenu.Sub
          open={isCalendarOpen}
          onOpenChange={setIsCalendarOpen}
        >
          <DropdownMenu.SubTrigger>Deadline</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <CalendarRangePicker
              value={selectedDate}
              onChange={setSelectedDate}
            />
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="COMPLETED" />
                  <span>Completed</span>
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="IN_PROGRESS" />
                  <span>In progress</span>
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="NOT_STARTED" />
                  <span>Not started</span>
                </label>
              </div>
            </CheckboxGroup.Root>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            Priority
            {priorityValues.length > 0 && (
              <span className="filter-badge">{priorityValues.length}</span>
            )}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <CheckboxGroup.Root
              value={priorityValues}
              onValueChange={setPriorityValues}
              name="priority-filters"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="HIGH" />
                  <span>High</span>
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="MEDIUM" />
                  <span>Medium</span>
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CheckboxGroup.Item value="LOW" />
                  <span>Low</span>
                </label>
              </div>
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
