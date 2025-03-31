import React from 'react'
import useStyles from './styles'

type HomeProps = {}

const Home: React.FC<HomeProps> = (props) => {
const { styles } = useStyles()

return <div className={styles.Home}></div>
}

export default Home