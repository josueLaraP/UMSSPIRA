'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Briefcase, Laptop, Calendar, 
  Pencil, Pause, ChevronRight, User
} from 'lucide-react';
import { getAccessToken } from '@/shared/services/auth-session';

export default function VacanteDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [vacante, setVacante] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Descripción');

  useEffect(() => {
    const fetchVacante = async () => {
      try {
        const token = getAccessToken();
        const response = await fetch('http://localhost:3000/api/v1/vacantes/mis-vacantes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const encontrada = data.find((v: any) => v.id === id);
          if (encontrada) {
            setVacante(encontrada);
          }
        }
      } catch (error) {
        console.error("Error cargando detalle", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacante();
  }, [id]);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando detalle...</div>;
  if (!vacante) return <div style={{ padding: '2rem', textAlign: 'center' }}>Vacante no encontrada</div>;

  return (
    <div style={{ backgroundColor: 'var(--palladian)', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Volver */}
        <Link href="/empresa/mis-vacantes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver a Mis vacantes
        </Link>

        {/* HEADER PRINCIPAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--flame)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 4px 12px rgba(255,177,98,0.3)' }}>
              <Briefcase size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: 0 }}>{vacante.titulo}</h1>
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {vacante.estado === 'PUBLICADA' ? 'Activa' : vacante.estado}
                </span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '0.95rem', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
                ID #{vacante.id.split('-')[0]} • Publicado {new Date(vacante.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ padding: '0.6rem 1.2rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: '#111827', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Pause size={16} /> Pausar vacante
            </button>
            <button style={{ padding: '0.6rem 1.2rem', border: 'none', backgroundColor: 'var(--flame)', color: '#fff', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,177,98,0.3)' }}>
              <Pencil size={16} /> Editar vacante
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL (2 Columnas) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA */}
          <div>
            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {['Python', 'Docker', 'REST APIs', 'PostgreSQL', 'FastAPI', 'AWS'].map(tag => (
                <span key={tag} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--oatmeal)', marginBottom: '1.5rem' }}>
              {['Descripción', 'Requisitos', 'Beneficios'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--ink)' : '2px solid transparent', fontWeight: activeTab === tab ? 800 : 600, color: activeTab === tab ? '#111827' : '#6b7280', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido de la Tab */}
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--oatmeal)', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>🎯 Propósito del Rol</h2>
              <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>
                {vacante.descripcion_tecnica || 'Buscamos un desarrollador para integrarse al equipo core. El principal objetivo es diseñar, escalar y optimizar microservicios.'}
              </p>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>✅ Responsabilidades Clave</h2>
              <ul style={{ color: '#374151', lineHeight: 1.8, paddingLeft: '1.2rem', margin: 0, fontWeight: 500 }}>
                <li>Diseñar e implementar endpoints RESTful seguros y eficientes usando Python (FastAPI/Django).</li>
                <li>Optimizar consultas complejas y diseñar modelos relacionales en PostgreSQL.</li>
                <li>Mantener y mejorar el pipeline de integración continua (CI/CD).</li>
                <li>Escribir pruebas unitarias y de integración.</li>
              </ul>
            </div>

            {/* Candidatos */}
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--oatmeal)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Candidatos Recientes</h2>
                <span style={{ backgroundColor: 'var(--flame)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800 }}>Nuevo</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Mateo Gómez', match: '96%', stage: 'En revisión', time: 'Hace 2 horas' },
                  { name: 'Camila López', match: '92%', stage: 'Entrevista', time: 'Hace 6 horas' },
                ].map((cand, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>{cand.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Postuló {cand.time}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Afinidad (Match)</p>
                        <p style={{ margin: 0, fontWeight: 800, color: '#15803d' }}>{cand.match}</p>
                      </div>
                      <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>{cand.stage}</span>
                      <ChevronRight size={18} color="#9ca3af" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Sidebar de la vacante) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Candidaturas Totales */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--oatmeal)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Candidaturas Totales</p>
                <User size={20} color="var(--flame)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>24</span>
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, marginBottom: '0.2rem' }}>+3 hoy</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', marginBottom: '0.5rem' }}>
                <div style={{ width: '67%', height: '100%', backgroundColor: 'var(--flame)', borderRadius: '3px' }}></div>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>Conversión del embudo: 67% calificados</p>
              <button style={{ width: '100%', padding: '0.6rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '0.5rem', fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                Gestionar postulaciones <ChevronRight size={16} />
              </button>
            </div>

            {/* Detalles de la posición */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--oatmeal)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>Detalles de la posición</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Laptop size={18} color="#6b7280" />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Modalidad de trabajo</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>{vacante.modalidad}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase size={18} color="#6b7280" />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Nivel de experiencia</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>{vacante.nivel_experiencia}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color="#6b7280" />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Fecha de publicación</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>{new Date(vacante.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de actividad */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--oatmeal)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>Historial de actividad</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #f3f4f6', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.35rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--flame)' }}></div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.8rem' }}>Publicación de vacante</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280' }}>{new Date(vacante.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.35rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.8rem' }}>Última actualización</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280' }}>Hoy</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}