import { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";

import Home from "./components/home";
import Login from "./components/login";
import Reservations from "./components/reservations";
import Charging from "./components/charging";
import Management from "./components/management";
import Profile from "./components/profile";
import Forgot from "./components/forgot";
import Checkout from "./components/checkout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./config/firebase";
import Register from "./components/register";
import { UserProvider } from "./components/userContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user: any) => {
      setUser(user);
    });
  });
  return (

  <UserProvider>
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              EV
            </a>
            {/* For smaller screens */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav me-auto">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/"
                >
                  Home
                </NavLink>
                {user && (
                  <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/Management"
                >
                  Manage
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/Reservations"
                >
                  Reservations
                </NavLink>
                </>
                )}
              </div>
              <div className="navbar-nav">
                {user ? (
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="/profile"
                  >
                    Profile
                  </NavLink>
                ) : (
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="/Login"
                  >
                    Login/Register
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Reservations" element={<Reservations />} />
            <Route path="/Charging" element={<Charging />} />
            <Route path="/Forgot" element={<Forgot />} />
            <Route path="/Checkout" element={<Checkout />} />
            <Route path="/Management" element={<Management />} />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/Login" />}
            />

            <Route
              path="/Login"
              element={user ? <Navigate to="/profile" /> : <Login />}
            />
            <Route path="/Register" element={<Register />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </Router>
  </UserProvider>
  );
}

export default App;
