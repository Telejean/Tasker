import s from './HomeCard.module.css'

const HomeCard = ({ title, children }) => {
  return (
    <div className={s.homeCardContainer}>
      {
        title ?
      <h2 className={s.homeCardTitle}>{title}</h2>
      :null
      }
      <div className={s.homeCardChildContainer}>
        {children}
      </div>
    </div>
  )
}

export default HomeCard
