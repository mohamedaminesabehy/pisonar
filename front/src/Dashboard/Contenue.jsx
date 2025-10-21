import "./Dashboard.css"
import equipe from "/src/assets/images/banner1.png";
const Contenue = () => {
  return (
    <div className="dashboards">
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome To Our Emergency Department App</h1>
          <p>Dashboard</p>
        </div>
        <img
          src={equipe}
          alt="Équipe médicale"
          className="banner-image"
        />
      </div>
    </div>
  )
}

export default Contenue