import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

export default function LeftNav() {
    const { session } = useAuth();

    return (
                <div className="left-nav">
                    <Nav.Link className="left-nav-link" as={Link} to={`profile/${session.user.id}`}>Profile</Nav.Link>
                    <Nav.Link className="left-nav-link">My Events</Nav.Link>
                    <Nav.Link className="left-nav-link">My Matches</Nav.Link>
                </div>
    );
}