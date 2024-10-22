import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Reservations from "./components/Reservations";
import Payments from "./components/Payments";
import Management from "./components/Management";

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              EV
            </a>

            {/*For smaller screens */}
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
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/Payments"
                >
                  Payments
                </NavLink>
              </div>
              <div className="navbar-nav">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/Login"
                >
                  Login/Register
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        <div id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Reservations" element={<Reservations />} />
            <Route path="/Payments" element={<Payments />} />
            <Route path="/Management" element={<Management />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
