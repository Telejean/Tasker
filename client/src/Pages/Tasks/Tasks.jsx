import { LuSquareKanban, LuList, LuCalendar, LuListFilter, LuArrowUpDown } from "react-icons/lu";
import s from './Tasks.module.css'
import { useState } from "react"; 
import tasks from "../../mock_tasks.json"
import { TasksTable } from "../../Components/Tables/TasksTable/TasksTable";
import { Separator } from "radix-ui";


const Tasks = () => {
  const [selectedView, setSelectedView] = useState('list');

  const getViewStyle = (viewName) => selectedView === viewName ? `${s.tasksView} ${s.tasksViewActive}` : s.tasksView;

  const handleAddTask = () => {
    console.log('add task')
  }
  
  console.log(selectedView)

  return (
    <div className={s.tasksContainer}>
      <h1 className={s.tasksTitle}>My Tasks</h1>
      <div className={s.tasksViewsContainer}>
        <div className={getViewStyle("list")} onClick={() => setSelectedView('list')}>
          <LuList />
          <p>List</p>
        </div>
        <div className={getViewStyle('board')} onClick={() => setSelectedView('board')}>
          <LuSquareKanban />
          <p>Board</p>
        </div>
        <div className={getViewStyle('calendar')} onClick={() => setSelectedView('calendar')}>
          <LuCalendar />
          <p>Calendar</p>
        </div>
      </div>


      <Separator/>

      <div className={s.tasksActionsContainer}>
        <button className={s.addTaskBtn} onClick={handleAddTask}>+ Add task</button>
        <div className={s.tasksActions}>
          <div className={s.tasksAction}>
            <LuListFilter />
            <p>Filter</p>
          </div>
          <div className={s.tasksAction}>
            <LuArrowUpDown />
            <p>Sort</p>
          </div>
        </div>
      </div>

      <div className="separator" />

      <div className={s.tasksTableContainer}>
        <TasksTable data={tasks}></TasksTable>
      </div>
    </div>
  )
}

export default Tasks
