import { Flex, Heading, Tabs, Box, Text } from "@radix-ui/themes";
import TasksFilter from "../../Components/TasksFilter/TasksFilter";
import { TasksAdd } from "../../Components/TasksAdd/TasksAdd";
import { atom, useAtom } from 'jotai'
import Kanban from "../../Components/Kanban/Kanban";
import { RangeValue, SortOptions, Task, TaskFilters } from "@/types"
import { DateValue } from "react-aria-components";
import TasksTable from "@/Components/Tables/TasksTable";
import TasksSort from "@/Components/TasksSort";
import { useEffect, useState } from "react";
import { taskService } from '@/services/task.service';
import { parseDate } from '@internationalized/date';

export const tasksAtom = atom<Task[]>([]);
export const filtersAtom = atom<TaskFilters>({});
export const sortAtom = atom<SortOptions>({ field: null, direction: null });

const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(filtersAtom);

  if (Object.keys(filters).length === 0) {
    return tasks;
  }

  return tasks.filter((task: Task) => {
    return Object.keys(filters).every((key) => {
      const filterKey = key as keyof TaskFilters;
      const filterValue = filters[filterKey];
      const taskValue = task[filterKey];

      if (filterKey === "deadline") {
        const deadlineFilter = filterValue as RangeValue<DateValue>;
        if (filterValue == null) return true;
        return task.deadline >= deadlineFilter.start && task.deadline <= deadlineFilter.end;
      }

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return true;
        return filterValue.includes(taskValue as string);
      } else {
        if (filterValue === "") return true;
        return taskValue === filterValue;
      }
    });
  });
});


const Tasks = () => {
  const [filteredTasks] = useAtom(filteredTasksAtom);
  const [, setTasks] = useAtom(tasksAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await taskService.getMyTasks();

        // Transform the task data to match the expected format
        const formattedTasks = tasksData.map((task: any) => ({
          id: task.id,
          projectName: task.project?.name || "No Project",
          name: task.name,
          deadline: task.deadline ? parseDate(new Date(task.deadline).toISOString().split('T')[0]) : null,
          description: task.description || "",
          assignedPeople: task.assignedPeople?.map((person: any) => person.user?.name || "Unknown") || [],
          status: task.status?.toLowerCase() || "not-started",
          priority: task.priority || "medium"
        }));

        setTasks(formattedTasks);
        setError("");
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [setTasks]);

  if (loading) {
    return (
      <Box p="6">
        <Text>Loading tasks...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6">
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <Box width={"100%"} p='4'>
      <Heading as='h1' align='center'>My Tasks</Heading>
      <Tabs.Root defaultValue="list">
        <Flex direction='column' gap='2'>

          <Tabs.List>
            <Tabs.Trigger value="list">
              <Heading as="h2">
                List
              </Heading>
            </Tabs.Trigger>
            <Tabs.Trigger value="board">
              <Heading as="h2">
                Board
              </Heading>
            </Tabs.Trigger>
            <Tabs.Trigger value="calendar">
              <Heading as="h2">
                Calendar
              </Heading>
            </Tabs.Trigger>

          </Tabs.List>
          <Flex direction='row' gap='2' justify='between'>

            <TasksAdd onAddTask={setTasks} />

            <Flex gap='6'>
              <TasksFilter />
              <TasksSort />
            </Flex>
          </Flex>

          <Tabs.Content value="list">
            <TasksTable data={filteredTasks}></TasksTable>
          </Tabs.Content>

          <Tabs.Content value="board">
            <Kanban tasks={filteredTasks} />
          </Tabs.Content>

          <Tabs.Content value="calendar">
            calendar
          </Tabs.Content>

        </Flex>
      </Tabs.Root >
    </Box >
  )
}

export default Tasks
