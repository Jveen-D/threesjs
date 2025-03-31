import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'
import { ThemeProvider } from 'antd-style'

import Demo01 from './pages/Demo01'

function App() {

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo01" element={<Demo01 />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
