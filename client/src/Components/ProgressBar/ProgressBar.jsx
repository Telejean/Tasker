import s from './ProgressBar.module.css'
const ProgressBar = ({ progress }) => {
    return (
        <div className={s.progressBarContainer}>
            <div className={s.progressBar}>
                <div
                    className={s.progress}
                    style={
                        {
                            width: `${progress * 100}%`,
                        }}
                ></div>

            </div>
            {`${progress * 100}%`}
        </div>

    )
}

export default ProgressBar
