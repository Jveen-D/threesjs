import React from 'react'
import useStyles from './styles'

type Demo01Props = {}

const Demo01: React.FC<Demo01Props> = (props) => {
const { styles } = useStyles()

return <div className={styles.Demo01}></div>
}

export default Demo01