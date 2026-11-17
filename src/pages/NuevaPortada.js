import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaAward,
  FaBaby,
  FaBars,
  FaBone,
  FaCalendarCheck,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaComment,
  FaEye,
  FaFemale,
  FaFileAlt,
  FaFileMedicalAlt,
  FaGraduationCap,
  FaHandHoldingHeart,
  FaHeartbeat,
  FaInstagram,
  FaMapMarkerAlt,
  FaMicrophone,
  FaMicroscope,
  FaPhoneAlt,
  FaQuoteLeft,
  FaRibbon,
  FaShieldAlt,
  FaStethoscope,
  FaTimes,
  FaUserMd,
  FaWhatsapp,
} from "react-icons/fa";
import SEO from "../Components/SEO";
import GaleriaServicios from "../Components/Galeria/GaleriaServicios";
import logo from "../assets/vitalmed/LogoJGIcon.png";
import doctora from "../assets/vitalmed/jer.png";
import doctoraGrande from "../assets/vitalmed/Dra.Imag.png";
import "./NuevaPortada.css";

const WHATSAPP =
  "https://api.whatsapp.com/send?phone=584244664961&text=Hola%2C+soy+la+Asistente+de+la+Dra+Jeremmy+G+en+que+podemos+ayudarte";
const INSTAGRAM = "https://www.instagram.com/doctoraecos/";
const THREADS = "https://threads.net/@doctoraecos";
const MAPS = "https://maps.app.goo.gl/6FtTK7Bwu9TYon369";

const servicios = [
  {
    titulo: "Abdominal y pélvica",
    texto:
      "Evaluación de órganos abdominales, pelvis y vías urinarias con imágenes de alta resolución.",
    icon: <FaStethoscope />,
    tone: "teal",
  },
  {
    titulo: "Eco Doppler",
    texto:
      "Estudio del flujo sanguíneo arterial y venoso para un diagnóstico vascular preciso.",
    icon: <FaHeartbeat />,
    tone: "rose",
  },
  {
    titulo: "Ecografía de mama",
    texto:
      "Ecografía mamaria y doppler para complementar el control y la detección temprana.",
    icon: <FaRibbon />,
    tone: "amber",
  },
  {
    titulo: "Ginecológica",
    texto:
      "Ecografía transvaginal, pélvica y mapeo para endometriosis profunda.",
    icon: <FaFemale />,
    tone: "violet",
  },
  {
    titulo: "Musculoesquelética",
    texto:
      "Evaluación de tendones, músculos, ligamentos y articulaciones en tiempo real.",
    icon: <FaBone />,
    tone: "blue",
  },
  {
    titulo: "Pediátrica",
    texto:
      "Estudios adaptados a bebés y niños, con la calidez y paciencia que necesitan.",
    icon: <FaBaby />,
    tone: "green",
  },
];

const beneficios = [
  {
    titulo: "Tecnología de última generación",
    texto:
      "Equipos de alta resolución para obtener imágenes nítidas y diagnósticos más precisos.",
    icon: <FaMicroscope />,
  },
  {
    titulo: "Informes claros y oportunos",
    texto:
      "Resultados explicados con claridad para que puedas tomar decisiones con tranquilidad.",
    icon: <FaFileMedicalAlt />,
  },
  {
    titulo: "Atención personalizada",
    texto:
      "Cada paciente es único. Escuchamos, orientamos y acompañamos durante todo el estudio.",
    icon: <FaHandHoldingHeart />,
  },
  {
    titulo: "+18 años de experiencia",
    texto:
      "Una trayectoria dedicada a la ultrasonografía diagnóstica e intervencionista.",
    icon: <FaAward />,
  },
];

const pasos = [
  {
    titulo: "Elegí tu estudio",
    texto: "Seleccioná el estudio que necesitás o consultanos si tenés dudas.",
    icon: <FaStethoscope />,
  },
  {
    titulo: "Reservá tu turno",
    texto: "Agendá online en minutos o escribinos directamente por WhatsApp.",
    icon: <FaCalendarCheck />,
  },
  {
    titulo: "Asistí a tu cita",
    texto: "Llegá unos minutos antes. Te recibimos con una atención cercana.",
    icon: <FaUserMd />,
  },
  {
    titulo: "Recibí tu informe",
    texto: "Accedé a un informe claro y oportuno con las indicaciones necesarias.",
    icon: <FaFileAlt />,
  },
];

const faqs = [
  {
    q: "¿Cómo agendo mi cita?",
    a: "Podés reservar online desde el botón “Agendar cita” o escribirnos por WhatsApp. También podés ingresar como paciente para gestionar tus turnos.",
  },
  {
    q: "¿Qué preparación necesito para mi estudio?",
    a: "La preparación depende del estudio. Al reservar verás las indicaciones correspondientes y también podemos orientarte por WhatsApp.",
  },
  {
    q: "¿Dónde está el consultorio?",
    a: "En el Centro Policlínico Valencia (Clínica La Viña), Torre C, Piso 1, Consultorio 102, Valencia, Carabobo.",
  },
  {
    q: "¿Qué formas de pago aceptan?",
    a: "Divisa en efectivo o pago móvil al cambio BCV. Consultanos por WhatsApp si necesitás confirmar el monto del estudio.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "DiagnosticLab"],
  name: "DoctoraEcos - Dra. Jeremmy Gutierrez",
  description:
    "Centro especializado en ecografías y ultrasonografía diagnóstica en Valencia, Carabobo, Venezuela.",
  url: "https://doctoraecos.com/",
  telephone: "+584244664961",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Centro Policlínico Valencia (La Viña), Torre C, Piso 1, Consultorio 102",
    addressLocality: "Valencia",
    addressRegion: "Carabobo",
    addressCountry: "VE",
  },
  sameAs: [INSTAGRAM, THREADS, WHATSAPP],
};

export default function NuevaPortada({ preview = true }) {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const usuario = JSON.parse(localStorage.getItem("userLog") || "null");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(".np-reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("np-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("np-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  const agendar = () => {
    if (!usuario) {
      navigate("/reservar-sin-registro");
    } else if (usuario.rol === "paciente") {
      navigate("/admin/reservar-turno");
    } else {
      navigate("/admin/turnos");
    }
  };

  const ingresar = () => {
    navigate(usuario ? "/" : "/admin/auth");
  };

  const navLinks = [
    { label: "Servicios", id: "servicios" },
    { label: "Galería", id: "galeria" },
    { label: "Sobre la doctora", id: "sobre" },
    { label: "Cómo funciona", id: "proceso" },
    { label: "Contacto", id: "contacto" },
  ];

  return (
    <div
      className={`np-page ${preview ? "np-page--preview" : ""}`}
      ref={pageRef}
    >
      <SEO
        title="Ultrasonografía diagnóstica en Valencia"
        description="Estudios de ecografía y ultrasonido con la Dra. Jeremmy Gutierrez en Valencia, La Viña. Agenda online, atención personalizada y tecnología de última generación."
        keywords="ecografías Valencia, ultrasonido Carabobo, eco doppler, ecografía abdominal, ecografía de mama, DoctoraEcos, Dra Jeremmy Gutierrez"
        schema={schema}
      />

      <header className={`np-nav ${scrolled ? "np-nav-scrolled" : ""}`}>
        <div className="np-container np-nav-inner">
          <button
            type="button"
            className="np-brand"
            onClick={() => scrollTo("inicio")}
            aria-label="Ir al inicio"
          >
            <img src={logo} alt="DoctoraEcos" className="np-brand-logo" />
            <span className="np-brand-text">
              <strong className="np-brand-name">DoctoraEcos</strong>
              <span className="np-brand-sub">Ultrasonografía diagnóstica</span>
            </span>
          </button>

          <nav className={`np-nav-links ${menuOpen ? "np-open" : ""}`}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollTo(link.id);
                }}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="np-mobile-login"
              onClick={ingresar}
            >
              {usuario ? "Mi panel" : "Ingresar"}
            </button>
          </nav>

          <div className="np-nav-actions">
            <button
              type="button"
              className="np-btn np-btn-ghost"
              onClick={ingresar}
            >
              {usuario ? "Mi panel" : "Ingresar"}
            </button>
            <button
              type="button"
              className="np-btn np-btn-primary"
              onClick={agendar}
            >
              Agendar cita
            </button>
          </div>

          <button
            type="button"
            className="np-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="np-hero">
          <span className="np-hero-glow np-hero-glow-a" />
          <span className="np-hero-glow np-hero-glow-b" />

          <div className="np-container np-hero-inner">
            <div className="np-hero-copy np-reveal">
              <span className="np-pill">
                <span className="np-dot" />
                Ultrasonografía diagnóstica · Valencia
              </span>

              <h1>
                Diagnósticos <em>claros</em>.
                <br />
                Atención que tranquiliza.
              </h1>

              <p>
                Estudios de ecografía con tecnología de última generación y la
                experiencia de la Dra. Jeremmy Gutierrez para acompañarte con
                claridad y calidez.
              </p>

              <div className="np-hero-actions">
                <button
                  type="button"
                  className="np-btn np-btn-primary np-btn-lg"
                  onClick={agendar}
                >
                  Agendar mi cita <FaArrowRight />
                </button>
                <button
                  type="button"
                  className="np-btn np-btn-glass np-btn-lg"
                  onClick={ingresar}
                >
                  Ya soy paciente
                </button>
              </div>

              <div className="np-hero-trust">
                <div>
                  <strong>+18</strong>
                  <span>años de experiencia</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>diagnóstico por imagen</span>
                </div>
                <div>
                  <strong>La Viña</strong>
                  <span>Consultorio 102 · Valencia</span>
                </div>
              </div>
            </div>

            <div className="np-hero-visual np-reveal">
              <span className="np-hero-ring" />
              <div className="np-hero-image-wrap">
                <div className="np-hero-image-card">
                  <img
                    src={doctora}
                    alt="Dra. Jeremmy Gutierrez, especialista en ultrasonografía diagnóstica"
                    className="np-hero-doc"
                  />
                  <div className="np-hero-name-tag">
                    <strong>Dra. Jeremmy Gutierrez</strong>
                    <span>Especialista en ultrasonografía</span>
                  </div>
                </div>

                <div className="np-float-card np-float-a">
                  <span className="np-float-icon">
                    <FaStethoscope />
                  </span>
                  <div className="np-float-text">
                    <strong>Ecografía en tiempo real</strong>
                    <span>Resultados precisos</span>
                  </div>
                </div>

                <div className="np-float-card np-float-b">
                  <span className="np-float-icon">
                    <FaCalendarCheck />
                  </span>
                  <div className="np-float-text">
                    <strong>Agenda online</strong>
                    <span>Reservá en minutos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="np-section np-services">
          <div className="np-container">
            <div className="np-section-head np-reveal">
              <span className="np-kicker">Nuestros estudios</span>
              <h2>Ecografías y ultrasonidos para cada necesidad</h2>
              <p>
                Estudios diagnósticos realizados con equipos de alta resolución
                y un informe claro y oportuno.
              </p>
            </div>

            <div className="np-service-grid">
              {servicios.map((servicio, index) => (
                <article
                  key={servicio.titulo}
                  className={`np-service-card np-reveal np-tone-${servicio.tone}`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <span className="np-service-icon">{servicio.icon}</span>
                  <h3>{servicio.titulo}</h3>
                  <p>{servicio.texto}</p>
                  <button
                    type="button"
                    className="np-service-link"
                    onClick={agendar}
                  >
                    Agendar <FaArrowRight />
                  </button>
                </article>
              ))}
            </div>

            <div className="np-services-foot np-reveal">
              <p>
                <strong>¿No sabés qué estudio necesitás?</strong> Te orientamos
                para elegir el más adecuado.
              </p>
              <div className="np-services-foot-actions">
                <a className="np-btn np-btn-outline" href="#/estudios">
                  Ver catálogo
                </a>
                <a
                  className="np-btn np-btn-outline"
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="np-band">
          <span className="np-hero-glow np-hero-glow-a" />
          <span className="np-hero-glow np-hero-glow-b" />

          <div className="np-container">
            <div className="np-section-head np-section-head--light np-reveal">
              <span className="np-kicker np-kicker--light">Por qué elegirnos</span>
              <h2>Precisión, calidez y tecnología en cada estudio</h2>
              <p>
                Un espacio pensado para que tu experiencia sea clara, cómoda y
                confiable.
              </p>
            </div>

            <div className="np-benefit-grid">
              {beneficios.map((beneficio, index) => (
                <article
                  key={beneficio.titulo}
                  className="np-benefit-card np-reveal"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <span className="np-benefit-icon">{beneficio.icon}</span>
                  <h3>{beneficio.titulo}</h3>
                  <p>{beneficio.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="np-section np-about">
          <div className="np-container np-about-inner">
            <div className="np-about-visual np-reveal">
              <div className="np-about-image-card">
                <img
                  src={doctoraGrande}
                  alt="Dra. Jeremmy Gutierrez, especialista en ultrasonografía"
                />
              </div>
              <div className="np-about-badge">
                <strong>+18</strong>
                <span>años de experiencia</span>
              </div>
            </div>

            <div className="np-about-copy np-reveal">
              <span className="np-kicker">Sobre la especialista</span>
              <h2>Dra. Jeremmy Gutierrez</h2>
              <p>
                Médico especialista en Ultrasonografía Diagnóstica e
                Intervencionista, con más de 18 años de trayectoria y una
                vocación clara: brindar diagnósticos con certidumbre clínica.
              </p>

              <blockquote>
                <FaQuoteLeft />
                <p>
                  Mi objetivo es brindarte un diagnóstico con certidumbre
                  clínica, permitiendo encaminar las acciones pertinentes para
                  tu salud.
                </p>
              </blockquote>

              <ul className="np-cred-list">
                <li>
                  <FaGraduationCap />
                  <div>
                    <strong>Universidad de Carabobo</strong>
                    <span>Formación médica y especializaciones</span>
                  </div>
                </li>
                <li>
                  <FaAward />
                  <div>
                    <strong>Pionera en Venezuela</strong>
                    <span>Ecografía musculoesquelética y dermocutánea</span>
                  </div>
                </li>
                <li>
                  <FaMicrophone />
                  <div>
                    <strong>Speaker internacional</strong>
                    <span>Congresos de ecografía y diagnóstico por imagen</span>
                  </div>
                </li>
                <li>
                  <FaChalkboardTeacher />
                  <div>
                    <strong>Docente universitaria</strong>
                    <span>Formación de nuevos especialistas</span>
                  </div>
                </li>
              </ul>

              <button
                type="button"
                className="np-btn np-btn-primary"
                onClick={agendar}
              >
                Conocer la agenda <FaArrowRight />
              </button>
            </div>
          </div>
        </section>

        <GaleriaServicios onVerTodo={() => navigate("/servicios")} />

        <section id="proceso" className="np-section np-process">
          <div className="np-container">
            <div className="np-section-head np-section-head--center np-reveal">
              <span className="np-kicker">Cómo funciona</span>
              <h2>Reservar tu estudio es simple</h2>
              <p>En cuatro pasos tenés tu cita y tu informe.</p>
            </div>

            <div className="np-steps">
              {pasos.map((paso, index) => (
                <article
                  key={paso.titulo}
                  className="np-step np-reveal"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <span className="np-step-number">{`0${index + 1}`}</span>
                  <span className="np-step-icon">{paso.icon}</span>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="np-section np-faq">
          <div className="np-container">
            <div className="np-section-head np-reveal">
              <span className="np-kicker">Preguntas frecuentes</span>
              <h2>Todo lo que necesitás saber antes de tu cita</h2>
            </div>

            <div className="np-faq-grid">
              {faqs.map((faq, index) => (
                <details
                  key={faq.q}
                  className="np-faq-item np-reveal"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <summary>
                    {faq.q}
                    <span className="np-faq-plus" aria-hidden="true" />
                  </summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>

            <p className="np-faq-foot np-reveal">
              ¿Tenés otra duda?{" "}
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                Escribinos por WhatsApp
              </a>
            </p>
          </div>
        </section>

        <section id="contacto" className="np-cta">
          <span className="np-hero-glow np-hero-glow-a" />
          <span className="np-hero-glow np-hero-glow-b" />

          <div className="np-container np-cta-inner">
            <div className="np-reveal">
              <span className="np-kicker np-kicker--light">Agendá tu cita</span>
              <h2>Tu salud merece un diagnóstico claro</h2>
              <p>
                Reservá online o escribinos por WhatsApp. Estamos en Valencia,
                La Viña, con atención personalizada.
              </p>
            </div>

            <div
              className="np-cta-actions np-reveal"
              style={{ transitionDelay: "100ms" }}
            >
              <button
                type="button"
                className="np-btn np-btn-primary np-btn-lg"
                onClick={agendar}
              >
                Agendar cita <FaArrowRight />
              </button>
              <a
                className="np-btn np-btn-glass np-btn-lg"
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp /> WhatsApp
              </a>
              <a
                className="np-btn np-btn-glass np-btn-lg"
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaMapMarkerAlt /> Cómo llegar
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="np-footer">
        <div className="np-container np-footer-grid">
          <div className="np-footer-brand">
            <div className="np-footer-logo">
              <img src={logo} alt="DoctoraEcos" />
              <div>
                <strong>DoctoraEcos</strong>
                <span>Ultrasonografía diagnóstica</span>
              </div>
            </div>
            <p>
              Diagnóstico por imagen con tecnología de última generación en
              Valencia, Venezuela.
            </p>
            <div className="np-socials">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a
                href={THREADS}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
              >
                <FaComment />
              </a>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ubicación"
              >
                <FaMapMarkerAlt />
              </a>
            </div>
            <span className="np-footer-trust">
              <FaShieldAlt /> Atención profesional y confidencial
            </span>
          </div>

          <div className="np-footer-col">
            <h4>Servicios</h4>
            <a href="#servicios" onClick={(event) => { event.preventDefault(); scrollTo("servicios"); }}>
              Ecografía abdominal
            </a>
            <a href="#servicios" onClick={(event) => { event.preventDefault(); scrollTo("servicios"); }}>
              Eco Doppler
            </a>
            <a href="#servicios" onClick={(event) => { event.preventDefault(); scrollTo("servicios"); }}>
              Ecografía de mama
            </a>
            <a href="#servicios" onClick={(event) => { event.preventDefault(); scrollTo("servicios"); }}>
              Musculoesquelética
            </a>
            <a href="#servicios" onClick={(event) => { event.preventDefault(); scrollTo("servicios"); }}>
              Ginecológica
            </a>
            <a href="#/estudios">Ver catálogo completo</a>
            <a href="#/servicios">Galería</a>
            <a href="#/cursos">Cursos VIP</a>
          </div>

          <div className="np-footer-col">
            <h4>Contacto</h4>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="tel:+584244664961">
              <FaPhoneAlt /> +58 424-466-4961
            </a>
            <a href={MAPS} target="_blank" rel="noopener noreferrer">
              <FaMapMarkerAlt /> La Viña, Valencia
            </a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              <FaInstagram /> @doctoraecos
            </a>
          </div>

          <div className="np-footer-col">
            <h4>Ubicación</h4>
            <p className="np-footer-address">
              Centro Policlínico Valencia (Clínica La Viña).
              <br />
              Torre C, Piso 1, Consultorio 102.
              <br />
              Valencia, Carabobo.
            </p>
            <p className="np-footer-note">
              <FaCheckCircle /> Atención con cita previa.
              <br />
              Divisa en efectivo o pago móvil al cambio BCV.
            </p>
          </div>
        </div>

        <div className="np-container np-footer-bottom">
          <span>© {new Date().getFullYear()} DoctoraEcos. Todos los derechos reservados.</span>
          <span>Dra. Jeremmy Gutierrez</span>
        </div>
      </footer>

      {preview && (
        <div className="np-preview-bar" role="status">
          <span>
            <FaEye /> Vista previa del nuevo inicio
          </span>
          <button type="button" onClick={() => navigate("/")}>
            Volver al inicio actual
          </button>
        </div>
      )}
    </div>
  );
}
