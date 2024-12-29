import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from 'react-bootstrap/Nav';

export default function LeftNav() {
    return (
        <Navbar>
            <Container>
                <Nav.Link>Profile</Nav.Link>
                <Nav.Link>My Events</Nav.Link>
                <Nav.Link>My Matches</Nav.Link>
            </Container>
        </Navbar>
    );
}