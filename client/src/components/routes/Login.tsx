import { createClient } from '@supabase/supabase-js'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Auth } from '@supabase/auth-ui-react'
import Button from 'react-bootstrap/Button';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';

export default function Login(props: any) {

    const { session } = useAuth();

    return (
        <div>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
    );
}