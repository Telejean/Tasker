import HomeCard from '../../Components/HomeCard/HomeCard'
import s from './Home.module.css'
import { tasks } from '../../sampleData'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
const columnHelper = createColumnHelper()
const columns = [
  columnHelper.accessor("taskName", {
    cell: info => info.getValue(),
    header: "Task Name",
  }),
]

const Home = () => {

  const table = useReactTable({
    tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={s.homeContainer}>
      <table>
        <thead>
          
        </thead>
      </table>

      <h3>wednesday, 19 February</h3>
      <h2>Good evening, Rareș</h2>
      <div className={s.homecardContainer}>
        <HomeCard title={"Tasks"} />
        <HomeCard title={"Projects"} />
        <HomeCard title={"People"} />
        <HomeCard />
      </div>

    </div>
  )
}

export default Home
