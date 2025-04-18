import { LuSquareKanban, LuList, LuCalendar, LuListFilter, LuArrowUpDown, LuCirclePlus } from "react-icons/lu";
import { sampleTasks } from "../../sampleData"
import { Flex, Heading, Button, Tabs, Box } from "@radix-ui/themes";
import TasksFilter from "../../Components/TasksFilter/TasksFilter";
import { TasksAdd } from "../../Components/TasksAdd/TasksAdd";
import { atom, useAtom } from 'jotai'
import Kanban from "../../Components/Kanban/Kanban";
import { RangeValue, Task, TaskFilters } from "@/types"
import { DateValue } from "react-aria-components";
import TasksTable from "@/Components/Tables/TasksTable/TasksTable";


export const tasksAtom = atom<Task[]>(sampleTasks);
export const filtersAtom = atom<TaskFilters>({});

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
  const [filteredTasks,] = useAtom(filteredTasksAtom);
  const [, setTasks] = useAtom(tasksAtom);

  // console.log({tasks:tasks})
  // console.log({filters:filters})
  // console.log({filteredTasks:filteredTasks})

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
              <Button >
                <LuArrowUpDown />
                <p>Sort</p>
              </Button>
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
