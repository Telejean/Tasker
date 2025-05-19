import { useAtom } from "jotai";
import s from "./Navbar.module.css"
import { LuSearch, LuInbox, LuCircleUser } from "react-icons/lu";
import { Link } from "react-router-dom";
import { userAtom } from "@/App";

const Navbar = () => {
const [user] = useAtom(userAtom);

  return (
    <div className={s.navbarContainer}>
      <h1 id={s.navbarTitle}>
        Tasker
      </h1>
      <div className={s.navbarSearch}>
        <p>search projects, tasks...</p>
        <LuSearch strokeWidth={3} size={30} />
      </div>
      <div className={s.navbarUserInfo}>
        <LuInbox strokeWidth={2} size={38} color={"#ffffff"} />
        <Link to={`/profile/${user.id}`}>
          <LuCircleUser strokeWidth={2} size={50} color={"#ffffff"} />
        </Link>
      </div>
    </div>
  )
}

export default Navbar
