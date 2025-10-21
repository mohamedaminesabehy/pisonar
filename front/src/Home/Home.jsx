// src/components/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaHeartbeat,
  FaBone,
  FaUserMd,
  FaTooth,
  FaXRay,
  FaProcedures,
  FaCapsules,
  FaUsers,
  FaSmile,
  FaAmbulance,
  FaHospital,
  FaBed,
  FaMoon,
  FaSun,
  FaExclamationTriangle,
  FaGlobe,
} from "react-icons/fa";

import log12 from "/src/assets/images/Logo.png";
import log from "/src/assets/images/llogo.jpg";
import hero from "/src/assets/images/hero.png";
import doc1 from "/src/assets/images/doc1.png";
import doc2 from "/src/assets/images/doc2.png";
import doc3 from "/src/assets/images/doc3.png";
import doc4 from "/src/assets/images/doc4.png";
import equipe22 from "/src/assets/images/tttttt.jpg";
import equipe3 from "/src/assets/images/banner2.png";

import "./Home.css";

const translations = {
  en: {
    brand: "Rescuify",
    slogan: "Your Health, Our Priority",
    nav: ["Home", "Doctors", "Services", "Reviews"],
    login: "Log In",
    reportEmergency: "Report An Emergency",
    dark: "Dark",
    light: "Light",
    epilepsy: "Epilepsy",
    normal: "Normal",
    heroTitle: "Your Health Is\nOur Top Priority",
    heroDesc: "Securely share your comprehensive medical history with\ndoctors and loved ones, for better communication and care.",
    stats: [
      {num: "500+", label: "Expert Doctors"},
      {num: "20k+", label: "Happy Patients"},
      {num: "24/7", label: "Emergency Service"},
      {num: "100+", label: "Operation Theatres"},
      {num: "850+", label: "Hospital Rooms"},
    ],
    servicesTitle: "Our Services",
    services: ["Neurology", "Cardiology", "Orthopedics", "Surgery", "Dentistry", "Radiology", "Urology", "Medicine"],
    treatmentTitle: "We Are Always Here To Ensure\nBest Medical Treatment",
    treatmentList: [
      "Easy online appointment",
      "Top specialist doctors",
      "24/7 service",
      "Discount for all medical treatments",
      "Enrollment is quick and easy"
    ],
    specialistsTitle: "Meet Our Specialists",
    specialists: [
      {name: "Dr. John Smith", role: "Cardiologist"},
      {name: "Dr. Kristin Watson", role: "Dentist"},
      {name: "Dr. Robert Flores", role: "Surgeon"},
      {name: "Dr. Katherine Allen", role: "Neurologist"},
    ],
    aboutTitle: "Who Are We?",
    aboutDesc: "A collaborative hospital service website is a digital platform that brings together healthcare professionals, patients and administrators to streamline care delivery. Through secure data sharing and integrated communication tools, it allows for seamless communication and coordination among healthcare teams, enabling them to provide more efficient and personalized care to patients.",
    feedbackTitle: "Patient Feedback",
    feedback: [
      {name: "Robin Edwards", text: "My experience with this hospital has been excellent. The staff is caring and professional, making every visit comfortable."},
      {name: "Josh Smith", text: "The medical professionals were able to catch all my symptoms and problems by listening."},
      {name: "Eleanor Ford", text: "One thing that stood out to me was the cleanliness of the facility and how organized everything was."}
    ],
    footer: {
      address: "4517 Tunis\nEsprit, Esprit 39495",
      phone: "+216 (20202183)",
      departments: ["Cardiology", "Neurology", "Dentistry", "Orthopedics", "Surgery"],
      quickLinks: ["Home", "Doctors", "Services", "Reviews"],
      talk: "Have Something To Talk About With Our Professionals?",
      emailPlaceholder: "Your Email"
    }
  },
  fr: {
    brand: "Rescuify",
    slogan: "Votre santé, notre priorité",
    nav: ["Accueil", "Médecins", "Services", "Avis"],
    login: "Se connecter",
    reportEmergency: "Signaler une urgence",
    dark: "Sombre",
    light: "Clair",
    epilepsy: "Épilepsie",
    normal: "Normal",
    heroTitle: "Votre santé est\nnotre priorité absolue",
    heroDesc: "Partagez en toute sécurité votre dossier médical complet avec\nles médecins et vos proches, pour une meilleure communication et prise en charge.",
    stats: [
      {num: "500+", label: "Médecins experts"},
      {num: "20k+", label: "Patients satisfaits"},
      {num: "24/7", label: "Service d'urgence"},
      {num: "100+", label: "Blocs opératoires"},
      {num: "850+", label: "Chambres d'hôpital"},
    ],
    servicesTitle: "Nos Services",
    services: ["Neurologie", "Cardiologie", "Orthopédie", "Chirurgie", "Dentisterie", "Radiologie", "Urologie", "Médecine"],
    treatmentTitle: "Nous sommes toujours là pour garantir\nles meilleurs soins médicaux",
    treatmentList: [
      "Prise de rendez-vous en ligne facile",
      "Médecins spécialistes de haut niveau",
      "Service 24/7",
      "Réduction pour tous les traitements médicaux",
      "Inscription rapide et facile"
    ],
    specialistsTitle: "Rencontrez nos spécialistes",
    specialists: [
      {name: "Dr. John Smith", role: "Cardiologue"},
      {name: "Dr. Kristin Watson", role: "Dentiste"},
      {name: "Dr. Robert Flores", role: "Chirurgien"},
      {name: "Dr. Katherine Allen", role: "Neurologue"},
    ],
    aboutTitle: "Qui sommes-nous ?",
    aboutDesc: "Un site collaboratif de services hospitaliers est une plateforme numérique qui réunit les professionnels de santé, les patients et les administrateurs pour optimiser la prise en charge. Grâce au partage sécurisé des données et à des outils de communication intégrés, il permet une coordination fluide entre les équipes médicales pour offrir des soins plus efficaces et personnalisés.",
    feedbackTitle: "Avis des patients",
    feedback: [
      {name: "Robin Edwards", text: "Mon expérience avec cet hôpital a été excellente. Le personnel est attentionné et professionnel, rendant chaque visite agréable."},
      {name: "Josh Smith", text: "Les professionnels de santé ont su détecter tous mes symptômes en m'écoutant."},
      {name: "Eleanor Ford", text: "Ce qui m'a marqué, c'est la propreté de l'établissement et l'organisation exemplaire."}
    ],
    footer: {
      address: "4517 Tunis\nEsprit, Esprit 39495",
      phone: "+216 (20202183)",
      departments: ["Cardiologie", "Neurologie", "Dentisterie", "Orthopédie", "Chirurgie"],
      quickLinks: ["Accueil", "Médecins", "Services", "Avis"],
      talk: "Vous souhaitez contacter nos professionnels ?",
      emailPlaceholder: "Votre email"
    }
  },
  ar: {
    brand: "ريسكويفي",
    slogan: "صحتك أولويتنا",
    nav: ["الرئيسية", "الأطباء", "الخدمات", "التقييمات"],
    login: "تسجيل الدخول",
    reportEmergency: "الإبلاغ عن حالة طارئة",
    dark: "داكن",
    light: "فاتح",
    epilepsy: "صرع",
    normal: "عادي",
    heroTitle: "صحتك هي\nأولويتنا القصوى",
    heroDesc: "شارك تاريخك الطبي الكامل بأمان مع\nالأطباء والأحباء، لتحسين التواصل والرعاية.",
    stats: [
      {num: "500+", label: "أطباء خبراء"},
      {num: "20k+", label: "مرضى سعداء"},
      {num: "24/7", label: "خدمة الطوارئ"},
      {num: "100+", label: "غرف العمليات"},
      {num: "850+", label: "غرف المستشفى"},
    ],
    servicesTitle: "خدماتنا",
    services: ["طب الأعصاب", "طب القلب", "جراحة العظام", "الجراحة", "طب الأسنان", "الأشعة", "المسالك البولية", "الطب"],
    treatmentTitle: "نحن دائمًا هنا لضمان\nأفضل علاج طبي",
    treatmentList: [
      "حجز موعد عبر الإنترنت بسهولة",
      "أفضل الأطباء المتخصصين",
      "خدمة 24/7",
      "خصم على جميع العلاجات الطبية",
      "التسجيل سريع وسهل"
    ],
    specialistsTitle: "تعرف على أطبائنا المتخصصين",
    specialists: [
      {name: "د. جون سميث", role: "طبيب قلب"},
      {name: "د. كريستين واتسون", role: "طبيبة أسنان"},
      {name: "د. روبرت فلوريس", role: "جراح"},
      {name: "د. كاثرين ألين", role: "طبيبة أعصاب"},
    ],
    aboutTitle: "من نحن؟",
    aboutDesc: "موقع خدمات المستشفى التعاوني هو منصة رقمية تجمع بين المهنيين الصحيين والمرضى والإداريين لتسهيل تقديم الرعاية. من خلال مشاركة البيانات بشكل آمن وأدوات الاتصال المتكاملة، يسمح بتواصل وتنسيق سلس بين فرق الرعاية الصحية لتقديم رعاية أكثر كفاءة وتخصيصًا.",
    feedbackTitle: "آراء المرضى",
    feedback: [
      {name: "روبن إدواردز", text: "تجربتي مع هذا المستشفى كانت ممتازة. الموظفون متفانون ومحترفون، مما جعل كل زيارة مريحة."},
      {name: "جوش سميث", text: "تمكن الأطباء من اكتشاف جميع الأعراض والمشاكل من خلال الاستماع لي."},
      {name: "إلينور فورد", text: "ما لفت انتباهي هو نظافة المنشأة والتنظيم الرائع."}
    ],
    footer: {
      address: "4517 تونس\nإسبرِت، إسبرِت 39495",
      phone: "+216 (20202183)",
      departments: ["طب القلب", "طب الأعصاب", "طب الأسنان", "جراحة العظام", "الجراحة"],
      quickLinks: ["الرئيسية", "الأطباء", "الخدمات", "التقييمات"],
      talk: "هل لديك استفسار لفريقنا الطبي؟",
      emailPlaceholder: "بريدك الإلكتروني"
    }
  }
};


export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    description: "",
    position: { longitude: 10.1815, latitude: 36.8065 },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [epilepsyMode, setEpilepsyMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const watchIdRef = useRef(null);

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Epilepsy mode toggle
  useEffect(() => {
    document.body.classList.toggle("epilepsy-mode", epilepsyMode);
  }, [epilepsyMode]);

  // RTL support
  useEffect(() => {
    document.body.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  }, [language]);

  // Geolocation when popup opens
  useEffect(() => {
    if (!showPopup) return;

    const geoOpts = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    // initial fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((p) => ({
            ...p,
            position: {
              longitude: pos.coords.longitude,
              latitude: pos.coords.latitude,
            },
          }));
          setError("");
        },
        (err) => {
          const msgMap = {
            [err.PERMISSION_DENIED]: "Location access denied.",
            [err.POSITION_UNAVAILABLE]: "Position unavailable.",
            [err.TIMEOUT]: "Location request timed out.",
          };
          setError(msgMap[err.code] || "Error fetching location.");
        },
        geoOpts
      );

      // watch for updates
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setFormData((p) => ({
            ...p,
            position: {
              longitude: pos.coords.longitude,
              latitude: pos.coords.latitude,
            },
          }));
        },
        (err) => {
          console.error("Watch error:", err);
        },
        geoOpts
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [showPopup]);

  const fetchCurrentPosition = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported. Enter coords manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setFormData((p) => ({
          ...p,
          position: {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          },
        })),
      () => setError("Unable to get location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      if (files[0] && files[0].size > 5 * 1024 * 1024) {
        setError("Image must be <5MB");
        return;
      }
      setFormData((p) => ({ ...p, image: files[0] || null }));
      setError("");
    } else if (name === "longitude" || name === "latitude") {
      const num = parseFloat(value);
      if (isNaN(num)) {
        setError(`${name} must be a number`);
        return;
      }
      setFormData((p) => ({
        ...p,
        position: { ...p.position, [name]: num },
      }));
      setError("");
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("longitude", formData.position.longitude);
    data.append("latitude", formData.position.latitude);
    if (formData.image) data.append("image", formData.image);

    try {
      const res = await fetch("http://localhost:3006/emergencies", {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Status ${res.status}`);
      }
      setSuccess("Emergency reported!");
      setFormData({
        title: "",
        image: null,
        description: "",
        position: { longitude: 10.1815, latitude: 36.8065 },
      });
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePopup = () => {
    setShowPopup((v) => !v);
    setError("");
    setSuccess("");
    if (showPopup) {
      setFormData({
        title: "",
        image: null,
        description: "",
        position: { longitude: 10.1815, latitude: 36.8065 },
      });
    }
  };

  if (showSplash) {
    return (
      <div className="splash-screen" role="alert" aria-live="polite">
        <div className="loading-circle" aria-hidden="true" />
        <img src={log12} alt="Hospital Logo" className="splash-logo" />
      </div>
    );
  }

  const t = translations[language];

  return (
    <div
      className={`home ${darkMode ? "dark-mode" : ""} ${
        epilepsyMode ? "epilepsy-mode" : ""
      }`}
    >
      <header className="header" role="banner">
        <div className="logo-container">
          <img src={log} alt="Medical Logo" className="logo" />
          <div>
            <h1 className="brand-name">{t.brand}</h1>
            <p className="slogan">{t.slogan}</p>
          </div>
        </div>

        <nav className="nav" role="navigation" aria-label="Main navigation">
          {t.nav.map((label, i) => (
            <ScrollLink
              key={i}
              to={["home", "doctors", "services", "reviews"][i]}
              smooth
              duration={500}
              role="link"
              tabIndex="0"
            >
              {label}
            </ScrollLink>
          ))}

          <button onClick={togglePopup} className="login-btnn">
            {t.reportEmergency}
          </button>

          <Link to="/Login" className="login-btn">
            {t.login}
          </Link>

          <div className="header-buttons">
            <button
              onClick={() => setDarkMode((m) => !m)}
              className="theme-toggle"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? t.light : t.dark}
            </button>

            <button
              onClick={() => setEpilepsyMode((m) => !m)}
              className="epilepsy-toggle"
              aria-label={
                epilepsyMode ? "Disable epilepsy mode" : "Enable epilepsy mode"
              }
            >
              <FaExclamationTriangle /> {epilepsyMode ? t.normal : t.epilepsy}
            </button>

            <div className="language-selector">
              <FaGlobe />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </nav>
      </header>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2 className="popup-title">Report an Emergency</h2>
              <button className="popup-close" onClick={togglePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <form
                id="emergency-form"
                onSubmit={handleSubmit}
                className="popup-form"
              >
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Image */}
                <div className="form-group">
                  <label htmlFor="image">Upload Image (Optional)</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="file-input"
                  />
                  {formData.image && (
                    <p className="file-name">{formData.image.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                {/* Coordinates */}
                <div className="form-group form-group-grid">
                  <div>
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={formData.position.longitude}
                      onChange={handleInputChange}
                      required
                      step="any"
                    />
                  </div>
                  <div>
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={formData.position.latitude}
                      onChange={handleInputChange}
                      required
                      step="any"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchCurrentPosition}
                  className="retry-location-btn"
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    background: "#0F598A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Retry Location
                </button>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
              </form>
            </div>
            <div className="popup-footer">
              <button onClick={togglePopup} className="cancel-btn">
                Cancel
              </button>
              <button
                type="submit"
                form="emergency-form"
                className="submit-btn"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h1>
              {t.heroTitle.split("\n").map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </h1>
            <p>
              {t.heroDesc.split("\n").map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </p>
          </div>
          <div className="hero-image">
            <img src={hero} alt="Medical Team" />
          </div>
        </section>

        {/* Stats */}
        <section className="stats">
          {t.stats.map((s, i) => (
            <div className="stat-card" key={i}>
              {[FaUsers, FaSmile, FaAmbulance, FaHospital, FaBed][i]({
                className: "stat-icon",
              })}
              <h3>{s.num}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </section>

        {/* Services */}
        <section id="services" className="services">
          <h2>{t.servicesTitle}</h2>
          <div className="services-grid">
            {t.services.map((svc, i) => (
              <div className="service-card" key={i}>
                {[
                  FaBrain,
                  FaHeartbeat,
                  FaBone,
                  FaUserMd,
                  FaTooth,
                  FaXRay,
                  FaProcedures,
                  FaCapsules,
                ][i]({ className: "service-icon" })}
                <h3>{svc}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Treatment */}
        <section className="treatment">
          <div className="treatment-content">
            <h2>
              {t.treatmentTitle.split("\n").map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </h2>
            <ul>
              {t.treatmentList.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
          <div className="treatment-image">
            <img src={equipe22} alt="Medical Team" />
          </div>
        </section>

        {/* Specialists */}
        <section id="doctors" className="specialists">
          <h2>{t.specialistsTitle}</h2>
          <div className="specialists-grid">
            {t.specialists.map((doc, i) => (
              <div className="specialist-card" key={i}>
                {[doc1, doc2, doc3, doc4][i] /* image import */}
                <img src={[doc1, doc2, doc3, doc4][i]} alt={doc.name} />
                <h3>{doc.name}</h3>
                <p>{doc.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="about">
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutDesc}</p>
          <img src={equipe3} alt="Medical Team" className="about-image" />
        </section>

        {/* Reviews */}
        <section id="reviews" className="feedback">
          <h2>{t.feedbackTitle}</h2>
          <div className="feedback-grid">
            {t.feedback.map((f, i) => (
              <div className="feedback-card" key={i}>
                <div className="feedback-content">
                  <h3>{f.name}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={log} alt="Hospital Logo" />
            <p>{t.footer.address}</p>
            <p>{t.footer.phone}</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h3>Departments</h3>
              <ul>
                {t.footer.departments.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                {t.footer.quickLinks.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <div className="footer-section">
              <h3>{t.footer.talk}</h3>
              <div className="footer-form">
                <input
                  type="email"
                  placeholder={t.footer.emailPlaceholder}
                />
                <button type="submit">→</button>
              </div>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  FB
                </a>
                <a href="#" aria-label="Twitter">
                  TW
                </a>
                <a href="#" aria-label="Instagram">
                  IG
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}