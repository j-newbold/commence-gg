import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from 'react-bootstrap/Nav';

export default function LeftNav() {
    return (
                <div className="left-nav">
                    <Nav.Link className="left-nav-link">Profile</Nav.Link>
                    <Nav.Link className="left-nav-link">My Events</Nav.Link>
                    <Nav.Link className="left-nav-link">My Matches</Nav.Link>
                </div>
    );
}