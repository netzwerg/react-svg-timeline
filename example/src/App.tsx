import Timeline from '../..'
import { events, lanes } from './data'
import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles({
    root: {
        display: 'grid',
        width: '100vw',
        height: '100vh'
    }
})

const App = () => {
    const classes = useStyles()
    const dateFormat = (ms: number) => timeFormat('%d.%m.%Y')(new Date(ms))
    return (
        <div className={classes.root}>
            <Timeline events={events} lanes={lanes} dateFormat={dateFormat} />
        </div>
    )
}

export default App
