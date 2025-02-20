import s from './HomeCard.module.css'

const HomeCard = ({title, children}) => {
  return (
    <div className={s.homeCardContainer}>
      <h2 className={s.homeCardTile}>{title}</h2>
    </div>
  )
}

export default HomeCard
