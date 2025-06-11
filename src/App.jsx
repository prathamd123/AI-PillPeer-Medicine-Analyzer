import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import ReportPage from './pages/ReportPage' 
import AboutPage from './pages/AboutPage'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/about" element={<AboutPage />} />

      </Routes>
    </Router>
  )
}

export default App
