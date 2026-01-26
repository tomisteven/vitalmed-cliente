import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEnvelope, FaIdCard, FaSignOutAlt, FaUsers, FaUserMd, FaCalendarAlt, FaStethoscope, FaClipboardList, FaChartLine, FaChartPie, FaCalendarCheck, FaUserPlus, FaClock, FaExclamationTriangle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./UsuarioLogueado.css";
import { LoaderIcon } from "react-hot-toast";
import { AuthAPI } from "../../api/auth";

const authApi = new AuthAPI();

// Componente para usuario normal (paciente/doctor)
function PerfilUsuario({ userProfile, userRole, handleLogout }) {
  const { nombre, email, usuario, dni, telefono, edad } = userProfile || {};
  const rol = userRole || userProfile?.rol;

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <FaUserCircle />
          </div>
          <h1 className="perfil-nombre">{nombre}</h1>
          <span className="perfil-rol">{rol}</span>
        </div>

        <div className="perfil-body">
          <h2 className="seccion-titulo">Información Personal</h2>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-content">
                <span className="info-label">Usuario</span>
                <span className="info-value">{usuario}</span>
              </div>
            </div>

            {email && (
              <div className="info-item">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{email}</span>
                </div>
              </div>
            )}

            {dni && (
              <div className="info-item">
                <div className="info-icon">
                  <FaIdCard />
                </div>
                <div className="info-content">
                  <span className="info-label">DNI</span>
                  <span className="info-value">{dni}</span>
                </div>
              </div>
            )}

            {telefono && (
              <div className="info-item">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{telefono}</span>
                </div>
              </div>
            )}

            {edad && (
              <div className="info-item">
                <div className="info-icon">🎂</div>
                <div className="info-content">
                  <span className="info-label">Edad</span>
                  <span className="info-value">{edad} años</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="perfil-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Dashboard para secretarias
function Dashboard({ userProfile, handleLogout, navigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTurnosDropdown, setShowTurnosDropdown] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await authApi.getDashboardStats();
      if (response && response.ok) {
        setStats(response);
      } else {
        setError("Error al cargar las estadísticas");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoaderIcon style={{ width: "50px", height: "50px", color: "#653057" }} />
        <p style={{ color: "white" }}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle style={{ color: "white" }} />
        <p>{error}</p>
        <button onClick={cargarEstadisticas}>Reintentar</button>
      </div>
    );
  }

  const { contadores, turnos, pacientes, estudios, tendencias } = stats || {};

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📊 Dashboard</h1>
          <p>Bienvenido/a, {userProfile?.nombre}</p>
        </div>
        <button className="btn-logout-dashboard" onClick={handleLogout}>
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>

      {/* Backdrop cuando el dropdown está abierto */}
      {showTurnosDropdown && (
        <div className="dropdown-backdrop" onClick={() => setShowTurnosDropdown(false)}></div>
      )}

      {/* Barra de Estado Destacada */}
      <div className={`status-bar-container ${showTurnosDropdown ? 'dropdown-open' : ''}`}>
        <div className="status-bar-importante">
          <div
            className="status-highlight clickable-highlight"
            onClick={() => setShowTurnosDropdown(!showTurnosDropdown)}
          >
            <div className="highlight-icon">🔥</div>
            <div className="highlight-content">
              <span className="highlight-number">
                {Array.isArray(turnos?.porPeriodo?.reservadosSemanaActual)
                  ? turnos.porPeriodo.reservadosSemanaActual.length
                  : 0}
              </span>
              <span className="highlight-label">Reservados Esta Semana</span>
            </div>
            <div className="highlight-toggle">
              {showTurnosDropdown ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

        </div>

        {/* Dropdown de Turnos Reservados */}
        {showTurnosDropdown && Array.isArray(turnos?.porPeriodo?.reservadosSemanaActual) && (
          <div className="turnos-dropdown">
            <div className="dropdown-header">
              <h4>📋 Turnos Reservados Esta Semana</h4>
              <button className="btn-close-dropdown" onClick={() => setShowTurnosDropdown(false)}>×</button>
            </div>
            <div className="dropdown-body">
              {turnos.porPeriodo.reservadosSemanaActual.length > 0 ? (
                turnos.porPeriodo.reservadosSemanaActual.map((turno) => (
                  <div
                    key={turno._id}
                    className="turno-item-dropdown"
                    onClick={() => navigate('/admin/turnos')}
                  >
                    <div className="turno-fecha-hora">
                      <span className="turno-dia">
                        {new Date(turno.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="turno-hora">
                        {new Date(turno.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="turno-info-dropdown">
                      <span className="turno-paciente">
                        👤 {turno.paciente?.nombre || turno.pacienteNoRegistrado?.nombre || 'Sin paciente'}
                      </span>
                      <span className="turno-estudio">
                        🔬 {turno.estudio?.tipo || 'Sin estudio'}
                      </span>
                      <span className="turno-doctor">
                        👨‍⚕️ {turno.doctor?.nombre || 'Sin doctor'}
                      </span>
                    </div>
                    <div className="turno-arrow">→</div>
                  </div>
                ))
              ) : (
                <p className="no-turnos-msg">No hay turnos reservados esta semana</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contadores principales */}
      <div className="stats-cards">
        <div className="stat-card stat-pacientes clickable" onClick={() => navigate('/admin/pacientes')}>
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-number">{contadores?.pacientes || 0}</span>
            <span className="stat-label">Pacientes</span>
          </div>
        </div>

        <div className="stat-card stat-doctores clickable" onClick={() => navigate('/admin/doctores')}>
          <div className="stat-icon"><FaUserMd /></div>
          <div className="stat-info">
            <span className="stat-number">{contadores?.doctores || 0}</span>
            <span className="stat-label">Doctores</span>
          </div>
        </div>

        <div className="stat-card stat-turnos clickable" onClick={() => navigate('/admin/turnos')}>
          <div className="stat-icon"><FaCalendarAlt /></div>
          <div className="stat-info">
            <span className="stat-number">{contadores?.turnos || 0}</span>
            <span className="stat-label">Turnos Totales</span>
          </div>
        </div>

        <div className="stat-card stat-estudios clickable" onClick={() => navigate('/admin/estudios')}>
          <div className="stat-icon"><FaStethoscope /></div>
          <div className="stat-info">
            <span className="stat-number">{contadores?.estudios || 0}</span>
            <span className="stat-label">Estudios</span>
          </div>
        </div>
      </div>

      {/* Sección de turnos */}
      <div className="dashboard-grid">
        {/* Turnos por Estado */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/turnos')}>
          <div className="card-header">
            <FaChartPie />
            <h3>Turnos por Estado</h3>
          </div>
          <div className="card-body">
            <div className="turnos-estado-grid">
              <div className="estado-item disponible">
                <span className="estado-numero">{turnos?.porEstado?.disponibles || 0}</span>
                <span className="estado-label">Disponibles</span>
              </div>
              <div className="estado-item reservado">
                <span className="estado-numero">{turnos?.porEstado?.reservados || 0}</span>
                <span className="estado-label">Reservados</span>
              </div>
              <div className="estado-item cancelado">
                <span className="estado-numero">{turnos?.porEstado?.cancelados || 0}</span>
                <span className="estado-label">Cancelados</span>
              </div>
              <div className="estado-item finalizado">
                <span className="estado-numero">{turnos?.porEstado?.finalizados || 0}</span>
                <span className="estado-label">Finalizados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Turnos por Período */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/turnos')}>
          <div className="card-header">
            <FaClock />
            <h3>Turnos por Período</h3>
          </div>
          <div className="card-body">
            <div className="periodo-lista">
              <div className="periodo-item">
                <span className="periodo-label">Hoy</span>
                <span className="periodo-badge">{turnos?.porPeriodo?.hoy || 0}</span>
              </div>
              <div className="periodo-item">
                <span className="periodo-label">Esta Semana</span>
                <span className="periodo-badge">{turnos?.porPeriodo?.estaSemana || 0}</span>
              </div>
              <div className="periodo-item">
                <span className="periodo-label">Este Mes</span>
                <span className="periodo-badge">{turnos?.porPeriodo?.esteMes || 0}</span>
              </div>
              <div className="periodo-item highlight">
                <span className="periodo-label">Futuros Reservados</span>
                <span className="periodo-badge">{turnos?.porPeriodo?.futurosReservados || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tipo de Pacientes */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/turnos')}>
          <div className="card-header">
            <FaUserPlus />
            <h3>Tipo de Pacientes en Turnos</h3>
          </div>
          <div className="card-body">
            <div className="pacientes-tipo">
              <div className="tipo-bar">
                <div className="tipo-info">
                  <span>Registrados</span>
                  <span className="tipo-numero">{turnos?.porTipoPaciente?.registrados || 0}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill registrado"
                    style={{
                      width: `${((turnos?.porTipoPaciente?.registrados || 0) /
                        ((turnos?.porTipoPaciente?.registrados || 0) + (turnos?.porTipoPaciente?.invitados || 0)) * 100) || 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="tipo-bar">
                <div className="tipo-info">
                  <span>Invitados</span>
                  <span className="tipo-numero">{turnos?.porTipoPaciente?.invitados || 0}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill invitado"
                    style={{
                      width: `${((turnos?.porTipoPaciente?.invitados || 0) /
                        ((turnos?.porTipoPaciente?.registrados || 0) + (turnos?.porTipoPaciente?.invitados || 0)) * 100) || 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pacientes */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/pacientes')}>
          <div className="card-header">
            <FaUsers />
            <h3>Resumen de Pacientes</h3>
          </div>
          <div className="card-body">
            <div className="resumen-stats">
              <div className="resumen-item">
                <span className="resumen-numero">{pacientes?.total || 0}</span>
                <span className="resumen-label">Total</span>
              </div>
              <div className="resumen-item highlight-green">
                <span className="resumen-numero">+{pacientes?.nuevosSemana || 0}</span>
                <span className="resumen-label">Esta Semana</span>
              </div>
              <div className="resumen-item highlight-blue">
                <span className="resumen-numero">+{pacientes?.nuevosMes || 0}</span>
                <span className="resumen-label">Este Mes</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-numero">{pacientes?.conDocumentos || 0}</span>
                <span className="resumen-label">Con Documentos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estudios más solicitados */}
        <div className="dashboard-card wide-card clickable" onClick={() => navigate('/admin/estudios')}>
          <div className="card-header">
            <FaClipboardList />
            <h3>Estudios Más Solicitados</h3>
          </div>
          <div className="card-body">
            {estudios?.masSolicitados?.length > 0 ? (
              <div className="estudios-ranking">
                {estudios.masSolicitados.slice(0, 5).map((estudio, index) => (
                  <div key={estudio._id} className="ranking-item">
                    <span className="ranking-position">#{index + 1}</span>
                    <div className="ranking-info">
                      <span className="ranking-nombre">{estudio.tipo}</span>
                      <span className="ranking-precio">${estudio.precio}</span>
                    </div>
                    <span className="ranking-total">{estudio.total} realizados</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Sin datos de estudios</p>
            )}
          </div>
        </div>

        {/* Turnos por Doctor */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/doctores')}>
          <div className="card-header">
            <FaUserMd />
            <h3>Turnos por Doctor</h3>
          </div>
          <div className="card-body">
            {turnos?.porDoctor?.length > 0 ? (
              <div className="doctor-lista">
                {turnos.porDoctor.map((doctor) => (
                  <div key={doctor._id} className="doctor-item">
                    <div className="doctor-info">
                      <span className="doctor-nombre">{doctor.nombre}</span>
                      <span className="doctor-especialidad">{doctor.especialidad}</span>
                    </div>
                    <span className="doctor-turnos">{doctor.totalTurnos} turnos</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Sin datos de doctores</p>
            )}
          </div>
        </div>

        {/* Tendencia de Turnos */}
        <div className="dashboard-card clickable" onClick={() => navigate('/admin/turnos')}>
          <div className="card-header">
            <FaChartLine />
            <h3>Tendencia de Turnos</h3>
          </div>
          <div className="card-body">
            {tendencias?.turnosPorDia?.length > 0 ? (
              <div className="tendencia-lista">
                {tendencias.turnosPorDia.slice(-7).map((dia) => (
                  <div key={dia._id} className="tendencia-item">
                    <span className="tendencia-fecha">
                      {new Date(dia._id).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <div className="tendencia-barra-container">
                      <div
                        className="tendencia-barra disponibles"
                        style={{ width: `${(dia.disponibles / dia.total) * 100}%` }}
                        title={`Disponibles: ${dia.disponibles}`}
                      ></div>
                      <div
                        className="tendencia-barra reservados"
                        style={{ width: `${(dia.reservados / dia.total) * 100}%` }}
                        title={`Reservados: ${dia.reservados}`}
                      ></div>
                    </div>
                    <span className="tendencia-total">{dia.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Sin datos de tendencia</p>
            )}
          </div>
        </div>

        {/* Estudios Activos */}
        <div className="dashboard-card small-card clickable" onClick={() => navigate('/admin/estudios')}>
          <div className="card-header">
            <FaCalendarCheck />
            <h3>Estado de Estudios</h3>
          </div>
          <div className="card-body">
            <div className="estudios-estado">
              <div className="estado-circular">
                <div className="circular-progress">
                  <span className="circular-numero">{estudios?.activos || 0}</span>
                  <span className="circular-label">Activos</span>
                </div>
                <span className="circular-total">de {estudios?.total || 0} totales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con última actualización */}
      <div className="dashboard-footer">
        <p>Última actualización: {new Date(stats?.timestamp).toLocaleString('es-ES')}</p>
        <button className="btn-refresh" onClick={cargarEstadisticas}>
          🔄 Actualizar Datos
        </button>
      </div>
    </div>
  );
}

// Componente principal
export default function UsuarioLogueado() {
  const usuario$ = JSON.parse(localStorage.getItem("userLog"));

  if (!usuario$ || !usuario$.usuario) {
    return (
      <div className="container-pacientes-loader">
        <LoaderIcon
          style={{
            width: "40px",
            height: "40px",
            color: "#667eea",
            marginTop: "50px",
          }}
        />
      </div>
    );
  }

  const { usuario: userProfile, rol: userRole } = usuario$;
  const rol = userRole || userProfile?.rol;
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("¿Está seguro que desea cerrar sesión?")) {
      localStorage.removeItem("userLog");
      window.location.href = "/";
    }
  };

  // Si es secretaria, mostrar dashboard
  if (rol === "secretaria" || rol === "admin" || rol === "Secretaria") {
    return <Dashboard userProfile={userProfile} handleLogout={handleLogout} navigate={navigate} />;
  }

  // Para pacientes y doctores, mostrar perfil normal
  return (
    <PerfilUsuario
      userProfile={userProfile}
      userRole={userRole}
      handleLogout={handleLogout}
    />
  );
}
