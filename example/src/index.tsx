import { App } from './App'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createTheme, ThemeProvider } from '@material-ui/core'

const materialTheme = createTheme()

ReactDOM.render(
  <ThemeProvider theme={materialTheme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
)
