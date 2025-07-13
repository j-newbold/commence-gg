import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import LeftNav from '../leftnav/LeftNav';
import '../../index.css';

export default function Home() {
    const { session } = useAuth();

    return (
        <>
            {session?
                <LeftNav /> :
                <></>}
            <div className="main-panel">
                <Outlet />
            </div>
        </>
    );
}