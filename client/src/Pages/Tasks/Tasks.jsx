import { LuSquareKanban, LuList, LuCalendar, LuListFilter, LuArrowUpDown, LuCirclePlus } from "react-icons/lu";
import s from './Tasks.module.css'
import { useEffect, useState } from "react";
import tasks from "../../mock_tasks.json"
import { TasksTable } from "../../Components/Tables/TasksTable/TasksTable";
import { Flex, Heading, Button, Tabs, Box, Text } from "@radix-ui/themes";
import TasksFilter from "../../Components/TasksFilter/TasksFilter";
import CalendarRangePicker from "../../Components/DateRangePicker/CalendarRangePicker";
import { DateRangePicker } from "react-aria-components";


const Tasks = () => {
  const [selectedView, setSelectedView] = useState('list');

  const getViewStyle = (viewName) => selectedView === viewName ? `${s.tasksView} ${s.tasksViewActive}` : s.tasksView;

  const handleAddTask = () => {
    console.log('add task')
  }

  useEffect(() => {
    const handleClick = (e) => {
      console.log("Clicked element:", e.target);
      console.log("Event propagation path:", e.composedPath());
      console.log("Focused element:", document.activeElement)
    };
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true); // cleanup!
    };
  }, [])

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
            <Box>
              <Button size='3' >
                <LuCirclePlus size="1.5em" strokeWidth={3} />
                Add task
              </Button>
            </Box>


            <CalendarRangePicker />


            <Flex gap='6'>
              <TasksFilter />

              <Button >
                <LuArrowUpDown />
                <p>Sort</p>
              </Button>
            </Flex>
          </Flex>


          {/* <CalendarRangePicker /> */}

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
