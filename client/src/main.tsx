import { StrictMode, useState, createContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from './components/routes/Login.tsx';
import Home from './components/routes/Home.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import EList from './components/routes/EList.tsx';
import Event from './components/routes/Event.tsx';
import CreateEvent from './components/routes/CreateEvent.tsx';
import Tournament from './components/routes/Tournament.tsx';
import Profile from './components/routes/Profile.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route element={<App />} >
                    <Route path='login' element={<Login/>} />
                    <Route path='' element={<Home />}>
                        <Route index element={<EList />} />
                        <Route path='event/:id/' element={<Event />} />
                        <Route path='event/:id/tournament/:tid' element={<Tournament />} />
                        <Route path='profile/:id' element={<Profile />} />
                    </Route>
                    <Route path='createEvent' element={<CreateEvent />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
