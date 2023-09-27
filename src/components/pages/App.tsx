import React, { useState } from "react";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";
// https://fluentsite.z22.web.core.windows.net/quick-start
import { Loader } from "@fluentui/react-northstar";
import { ThemeProvider, createTheme, Theme, PartialTheme } from "@fluentui/react";

import VisitReportView from "./VisitReportView";

import "../../styles/App.css";
import Navbar from "./Navbar";



function App() {
  window.localStorage.felaDevMode = true;
 

  

  return (
    <>   
        <ThemeProvider applyTo={"body"} className="App" >
          
            <Router> 
              <Navbar />
              <Route exact path="/">
                <Redirect to="/tab" />
              </Route>
             
                <>
                  <Route exact path="/tab" component={VisitReportView} />
                </>
              
            </Router>
          
        </ThemeProvider>
 
    </>
  );
}

export default App;
