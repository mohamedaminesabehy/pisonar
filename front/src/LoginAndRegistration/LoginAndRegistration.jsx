import { useState } from "react"
import Login from "./Login/Login"
import Registration from "./Registration/Registration"
import "./LoginAndRegistration.css"
import log1 from "/src/assets/images/llogo.jpg";
import { Link } from 'react-router-dom'; // Import Link from react-router-dom



export default function LoginAndRegistration() {
  const [currentView, setCurrentView] = useState("login")

  return (
    <div className="LoginAndRegistration">
      <header className="headerrr">
        <div className="logo-container">
          <img
            src={log1}
            alt="Medical Logo"
            className="logo"
          />
          <div>
            <h1 className="brand-name">Rescuify</h1>
            <p className="slogan">Your Health, Our Priority</p>
          </div>
        </div>

        <nav className="nav">
  <Link to="/" className="nav-link active">
    Go To Home
  </Link>
</nav>

      </header>

      <main className="main">
        <div className="view-toggle">
          <button
            className={`toggle-button ${currentView === "login" ? "active" : ""}`}
            onClick={() => setCurrentView("login")}
          >
            Login
          </button>
          <button
            className={`toggle-button ${currentView === "register" ? "active" : ""}`}
            onClick={() => setCurrentView("register")}
          >
            Register
          </button>
        </div>
        {currentView === "login" ? <Login /> : <Registration />}
      </main>
    </div>
  )
}

