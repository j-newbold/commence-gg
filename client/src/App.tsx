import { createContext, useContext, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import {NavDropdown} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Match from './components/Match.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { ElimBracket, MatchObj, Round, Player, RRPool } from './utils/types.tsx';
import SEBracket from './components/brackets/single elim/SEBracket.tsx';
import { createElimBracket, createRRPool } from './utils/initBrackets.tsx';
import RRPoolComponent from './components/brackets/RRPool.tsx';
import { createClient } from '@supabase/supabase-js'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Auth } from '@supabase/auth-ui-react'
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient.tsx';
import { useAuth } from './context/AuthContext.tsx';



function randStr() {
    return (Math.random() + 1).toString(36).substring(7);
}

function App() {

    const { session } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        await navigate('/');
    }

    useEffect(() => {
    }, []);

    const onSubmitForm = async (e: any) => {
        e.preventDefault();
        try {
            console.log('submitting form');
            const response = await fetch("http://localhost:5000/");
            const data = await response.json();
            console.log(data);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    return (
        <>
            <Navbar className='full-navbar'>
                    <Nav className='top-nav'>
                        <Nav.Link className='top-nav-link left-link' as={Link} to='/'>Commence.GG</Nav.Link>
                        {session?
                            <>
                                <Nav.Link className='top-nav-link right-link' as={Link} to='/createEvent'>Create Event</Nav.Link>
                                <NavDropdown title='User Menu' id='basic-nav-dropdown' className='top-nav-link right-link'>
                                    <NavDropdown.Item as={Link} to={`/profile/${session.user.id}`}>Profile</NavDropdown.Item>
                                    <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                                </NavDropdown>
                            </>:
                            <Nav.Link as={Link} className='top-nav-link right-link' to='/login'>Log in</Nav.Link>
                        }
                    </Nav>
            </Navbar>
            <div className='main-container'>
                <Outlet />
            </div>            
        </>
    );
}

export default App;