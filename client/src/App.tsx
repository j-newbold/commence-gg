import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
import { createClient } from '@supabase/supabase-js'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Auth } from '@supabase/auth-ui-react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './utils/supabaseClient.tsx';
import { useAuth } from './context/AuthContext.tsx';



function randStr() {
    return (Math.random() + 1).toString(36).substring(7);
}

function App() {

    const { session } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        await navigate('/');
    }

    useEffect(() => {
    }, []);

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
                            <Nav.Link
                                as={Link}
                                className='top-nav-link right-link'
                                to='/login'
                                state={{ previous: location.pathname }}>
                                    Log in
                            </Nav.Link>
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