import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import LeftNav from '../leftnav/LeftNav';

export default function Home() {
    const { session } = useAuth();

    return (
        <>
            {session?
                <LeftNav /> :
                <></>}
            <Outlet />
        </>
    );
}