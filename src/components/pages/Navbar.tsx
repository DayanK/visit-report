import React from "react";
import { Link, NavLink} from "react-router-dom";

/*
  This component is only used for development
*/
const Navbar = () => {
  return (
    <nav style={{
        width: '90vw',
        maxWidth: '50em',
        margin: '0 auto',
        display: 'flex',
        gap: '1rem'
    }}>
      {/* <NavLink to="/VisitReportView">Visit Report View</NavLink> */}

    </nav>
  );
};

export default Navbar;
