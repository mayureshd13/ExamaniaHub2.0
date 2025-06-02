import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Aptitude from './pages/Aptitude.jsx';
import Verbal from './pages/Verbal.jsx';
import Programming from './pages/Programming.jsx';
import Computer from './pages/Computer.jsx';
import Gk from './pages/Gk.jsx';
import Logical from './pages/Logical.jsx';
import GuessGuruPage from './pages/GuessGuru.jsx';
import Home from './pages/Home.jsx';
import TestPage from './pages/Test.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

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

        <Route
          path='/guessguru'
          element={
            <ProtectedRoute>
              <GuessGuruPage />
            </ProtectedRoute>
          }
        />

        <Route path='/tests' element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>

        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
