import { LuSquareKanban, LuList, LuCalendar, LuListFilter, LuArrowUpDown, LuCirclePlus } from "react-icons/lu";
import s from './Tasks.module.css'
import { useEffect, useState } from "react";
import tasks from "../../mock_tasks.json"
import { TasksTable } from "../../Components/Tables/TasksTable/TasksTable";
import { Flex, Heading, Button, Tabs, Box, Text, Dialog, TextField } from "@radix-ui/themes";
import TasksFilter from "../../Components/TasksFilter/TasksFilter";
import { TasksAdd } from "../../Components/TasksAdd/TasksAdd";
import { CalendarDatePicker } from "../../Components/DatePicker/CalendarDatePicker";
import { atom, useAtom } from 'jotai'



const tasksAtom = atom(tasks);
export const filtersAtom = atom({status:"completed"});

const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filter = get(filtersAtom);

  console.log(filter)

  return tasks.filter(task => {
    return Object.keys(filter).every(key => {
      if (Array.isArray(filter[key])) {
        console.log(filter[key])
        return filter[key].includes(task[key]);
      } else {
        return task[key] === filter[key];
      }
    });
  });
});


const Tasks = () => {
  const [selectedView, setSelectedView] = useState('list');
  const [filters, setFilters] = useAtom(filtersAtom);
  const [tasks,] = useAtom(filteredTasksAtom);
  const [, setTasks] = useAtom(tasksAtom);


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
            <div >
              <TasksTable data={tasks}></TasksTable>
            </div>
          </Tabs.Content>

          <Tabs.Content value="board">
            accounting
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
