import React from 'react'
import Aptitude from './pages/Aptitude.jsx';
import Verbal from './pages/Verbal.jsx';
import Programming from './pages/Programming.jsx';
import Computer from './pages/Computer.jsx';
import Gk from './pages/Gk.jsx';
import Logical from './pages/Logical.jsx'
import GuessGuruPage from './pages/GuessGuru.jsx';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import TestPage from './pages/Test.jsx';


function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/aptitude' element={<Aptitude />} />
        <Route path='/verbal-ability' element={<Verbal />} />
        <Route path='/computer-science' element={<Computer />} />
        <Route path='/programming' element={<Programming />} />
        <Route path='/general-knowledge' element={<Gk />} />
        <Route path='/logical-reasoning' element={<Logical />} />
        <Route path='/guessguru' element={<GuessGuruPage />} />
        <Route path='/tests' element={<TestPage />} />
      </Routes>

    </>
  )
}

export default App
