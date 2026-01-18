import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaStethoscope, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import './EstudiosPage.css';
import SEO from '../Components/SEO';

// Static data - In production, this would come from an API
const estudiosData = [
    { id: 1, tipo: "Ecografía Abdominal", precio: 75, categoria: "Abdominal", aclaraciones: "Tasa en €. Cancelada en: Divisa en efectivo o Via pago movil al cambio BCV.\nPREPARACION: Ayuno 6h" },
    { id: 2, tipo: "Ecografía Abdominal y Pélvica", precio: null, categoria: "Abdominal", aclaraciones: "" },
    { id: 3, tipo: "Ecografía pélvica con medición de volumen residual", precio: null, categoria: "Pélvica", aclaraciones: "" },
    { id: 4, tipo: "Ecografía prostática con medición de volumen residual", precio: null, categoria: "Pélvica", aclaraciones: "" },
    { id: 5, tipo: "Ecografía de partes blandas de pared abdominal", precio: null, categoria: "Partes Blandas", aclaraciones: "" },
    { id: 6, tipo: "Ecografía musculoesquelética por zona", precio: null, categoria: "Musculoesquelética", aclaraciones: "" },
    { id: 7, tipo: "Ecografía transvaginal", precio: null, categoria: "Ginecología", aclaraciones: "" },
    { id: 8, tipo: "Ecografía doppler transvaginal", precio: null, categoria: "Ginecología", aclaraciones: "" },
    { id: 9, tipo: "Ecografía doppler renal", precio: null, categoria: "Doppler", aclaraciones: "" },
    { id: 10, tipo: "Ecografía doppler de miembros inferiores", precio: null, categoria: "Doppler", aclaraciones: "" },
    { id: 11, tipo: "Ecografía doble de miembros inferiores (Arterial y Venosa)", precio: null, categoria: "Doppler", aclaraciones: "" },
    { id: 12, tipo: "Ecografía doppler de miembros inferiores Arterial", precio: null, categoria: "Doppler", aclaraciones: "" },
    { id: 13, tipo: "Ecografía doppler de miembros inferiores Venosa", precio: null, categoria: "Doppler", aclaraciones: "" },
    { id: 14, tipo: "Mapeo para endometriosis profunda", precio: null, categoria: "Ginecología", aclaraciones: "" },
    { id: 15, tipo: "Ecografía de mama", precio: null, categoria: "Mama", aclaraciones: "" },
    { id: 16, tipo: "Ecografía de mama con prótesis", precio: null, categoria: "Mama", aclaraciones: "" },
    { id: 17, tipo: "Ecografía doppler mamario", precio: null, categoria: "Mama", aclaraciones: "" },
    { id: 18, tipo: "Ecografía transfontanelar", precio: null, categoria: "Pediátrica", aclaraciones: "" },
    { id: 19, tipo: "Ecografía Doppler Esplenoportal", precio: 100, categoria: "Doppler", aclaraciones: "Tasa en €. Cancelada en: Divisa en efectivo o Via pago movil al cambio BCV.\nPREPARACION: Ayuno 6h" },
    { id: 20, tipo: "Ecografía Doppler Aórtico", precio: 95, categoria: "Doppler", aclaraciones: "Tasa en €. Cancelada en: Divisa en efectivo o Via pago movil al cambio BCV.\nPREPARACION: Ayuno 6h" },
];

const categorias = [
    { id: 'all', nombre: 'Todos', icon: '📋' },
    { id: 'Abdominal', nombre: 'Abdominal', icon: '🫁' },
    { id: 'Pélvica', nombre: 'Pélvica', icon: '🩺' },
    { id: 'Doppler', nombre: 'Doppler', icon: '❤️' },
    { id: 'Ginecología', nombre: 'Ginecología', icon: '👩' },
    { id: 'Mama', nombre: 'Mama', icon: '🎀' },
    { id: 'Musculoesquelética', nombre: 'Musculoesquelética', icon: '💪' },
    { id: 'Partes Blandas', nombre: 'Partes Blandas', icon: '🔬' },
    { id: 'Pediátrica', nombre: 'Pediátrica', icon: '👶' },
];

export default function EstudiosPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedCard, setExpandedCard] = useState(null);

    const filteredEstudios = useMemo(() => {
        return estudiosData.filter(estudio => {
            const matchesSearch = estudio.tipo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || estudio.categoria === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    const handleAgendarCita = () => {
        // Redirect to auth/login - user needs to be logged in to reserve appointments
        navigate('/admin/auth');
    };

    const proceduresSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": estudiosData.map((estudio, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "MedicalProcedure",
                "name": estudio.tipo,
                "description": estudio.aclaraciones || `Estudio de ultrasonografía: ${estudio.tipo}`,
                "procedureType": "Diagnostic",
                "category": estudio.categoria
            }
        }))
    };

    return (
        <div className="estudios-page">
            <SEO
                title="Estudios Médicos y Ecografías en Valencia"
                description="Catálogo de ecografías en Valencia, La Viña 2026: Eco Doppler, ecografía abdominal, obstétrica, musculoesquelética. Precios accesibles. Citas por WhatsApp. Dra. Jeremmy Gutierrez."
                keywords="precio ecografías Valencia 2026, eco doppler miembros inferiores La Viña, ecografía abdominal preparación, tipos de eco Carabobo, centro ecografías Valencia, citas WhatsApp"
                schema={proceduresSchema}
            />

            {/* Header */}
            <header className="estudios-header">
                <button className="btn-back" onClick={() => navigate('/')} aria-label="Volver al inicio">
                    <FaArrowLeft />
                    <span>Volver</span>
                </button>
                <div className="header-content">
                    <h1>Estudios Médicos</h1>
                    <p>Servicios especializados de ultrasonografía diagnóstica en Valencia, Venezuela</p>
                </div>
            </header>

            <main>
                {/* Search and Filters */}
                <section className="estudios-filters" aria-label="Filtros de búsqueda">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <label htmlFor="search-study" className="sr-only">Buscar estudio</label>
                        <input
                            id="search-study"
                            type="text"
                            placeholder="Buscar estudio (ej: Doppler, Abdominal)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="categories-container" role="group" aria-label="Categorías de estudios">
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                                aria-pressed={selectedCategory === cat.id}
                            >
                                <span className="category-icon" aria-hidden="true">{cat.icon}</span>
                                <span className="category-name">{cat.nombre}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results Count */}
                <div className="results-info" aria-live="polite">
                    <FaStethoscope aria-hidden="true" />
                    <span>{filteredEstudios.length} estudio{filteredEstudios.length !== 1 ? 's' : ''} encontrado{filteredEstudios.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Studies Grid */}
                <section className="estudios-grid" aria-label="Lista de estudios médicos">
                    {filteredEstudios.map(estudio => (
                        <article
                            key={estudio.id}
                            className={`estudio-card ${expandedCard === estudio.id ? 'expanded' : ''}`}
                        >
                            <div className="estudio-card-header">
                                <span className="estudio-categoria">{estudio.categoria}</span>
                                {estudio.precio && (
                                    <span className="estudio-precio">USD {estudio.precio}</span>
                                )}
                            </div>

                            <h3 className="estudio-nombre">{estudio.tipo}</h3>

                            {estudio.aclaraciones && (
                                <button
                                    className="btn-info"
                                    onClick={() => setExpandedCard(expandedCard === estudio.id ? null : estudio.id)}
                                    aria-expanded={expandedCard === estudio.id}
                                >
                                    <FaInfoCircle aria-hidden="true" />
                                    <span>Ver preparación</span>
                                </button>
                            )}

                            {expandedCard === estudio.id && estudio.aclaraciones && (
                                <div className="estudio-aclaraciones">
                                    <p>{estudio.aclaraciones}</p>
                                </div>
                            )}

                            <button
                                className="btn-agendar"
                                onClick={handleAgendarCita}
                            >
                                <FaCalendarAlt aria-hidden="true" />
                                <span>Agendar cita</span>
                            </button>
                        </article>
                    ))}
                </section>

                {filteredEstudios.length === 0 && (
                    <div className="no-results">
                        <FaSearch aria-hidden="true" />
                        <p>No se encontraron estudios que coincidan con su búsqueda.</p>
                    </div>
                )}
            </main>

            {/* Footer Info */}
            <footer className="estudios-footer">
                <p>
                    <strong>📍 Ubicación:</strong> Centro Policlínico Valencia (Clínica la Viña) Torre C piso 1 consultorio 102.
                </p>
                <p>
                    <strong>💳 Formas de pago:</strong> Divisa en efectivo o pago móvil al cambio BCV.
                </p>
            </footer>
        </div>
    );
}
