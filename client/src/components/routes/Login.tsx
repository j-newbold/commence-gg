import { createClient } from '@supabase/supabase-js'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Auth } from '@supabase/auth-ui-react'
import Button from 'react-bootstrap/Button';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import '../../index.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login(props: any) {

    const { session } = useAuth();

    return (
        <div className='login-route'>
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook']}
            />
        </div>
    );
}