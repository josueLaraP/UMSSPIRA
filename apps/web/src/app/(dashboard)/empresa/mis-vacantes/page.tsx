'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, FolderOpen, Search, Eye, Pencil, MoreVertical, 
  Pause, Trash2, Monitor, MapPin, BarChart2, Calendar, Ban
} from 'lucide-react';
import { getAccessToken } from '@/shared/services/auth-session';

interface Vacante {
  id: string;
  titulo: string;
  tecnologias: string;
  modalidad: string;
  nivel: string;
  estado: 'ACTIVA' | 'PAUSADA' | 'CERRADA' | 'BORRADOR';
  fecha_publicacion: string;
}

export default function MisVacantesPage() {
  const router = useRouter();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterModalidad, setFilterModalidad] = useState('Todas');
  const [filterNivel, setFilterNivel] = useState('Todos');
  
  const [vacanteACerrar, setVacanteACerrar] = useState<Vacante | null>(null);
  const [isCerrando, setIsCerrando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

  useEffect(() => {
    const fetchVacantes = async () => {
      setIsLoading(true);
      try {
        const token = getAccessToken();
        const response = await fetch('http://localhost:3000/api/v1/vacantes/mis-vacantes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          setVacantes([]);
          return;
        }
        
        const formateadas = data.map((v: any) => {
          const estadoRaw = String(v.estado || '').toUpperCase().trim();
          const modalidadRaw = String(v.modalidad || '').toUpperCase().trim();
          const nivelRaw = String(v.nivel_experiencia || '').toUpperCase().trim();

          let estadoUI: 'ACTIVA' | 'PAUSADA' | 'CERRADA' | 'BORRADOR' = 'BORRADOR';
          if (['PUBLICADO', 'PUBLICADA', 'ACTIVA', 'ACTIVO', 'ACTIVE', 'PUBLISHED'].includes(estadoRaw)) estadoUI = 'ACTIVA';
          if (['PAUSADO', 'PAUSADA', 'PAUSED'].includes(estadoRaw)) estadoUI = 'PAUSADA';
          if (['CERRADO', 'CERRADA', 'CLOSED'].includes(estadoRaw)) estadoUI = 'CERRADA';

          let modalidadUI = 'Presencial';
          if (['REMOTO', 'REMOTE'].includes(modalidadRaw)) modalidadUI = 'Remoto';
          if (['HIBRIDO', 'HÍBRIDO', 'HYBRID', 'HIBRIDA', 'HÍBRIDA'].includes(modalidadRaw)) modalidadUI = 'Híbrido';

          let nivelUI = 'Senior';
          if (['JUNIOR', 'JR'].includes(nivelRaw)) nivelUI = 'Junior';
          if (['SEMI-SENIOR', 'SEMISENIOR', 'SEMI_SENIOR', 'MID'].includes(nivelRaw)) nivelUI = 'Semi-Senior';

          return {
            id: v.id,
            titulo: v.titulo,
            tecnologias: v.descripcion_tecnica || 'Sin descripción',
            modalidad: modalidadUI,
            nivel: nivelUI,
            estado: estadoUI,
            fecha_publicacion: v.created_at ? new Date(v.created_at).toLocaleDateString('es-ES') : 'Sin fecha',
          };
        });

        setVacantes(formateadas);
      } catch (error) {
        console.error("Error al cargar de la BD:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacantes();
  }, []);

  const handleConfirmarCierre = async () => {
    if (!vacanteACerrar) return;
    setIsCerrando(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`http://localhost:3000/api/v1/vacantes/${vacanteACerrar.id}/cerrar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al cerrar');
      setVacantes((prev) => 
        prev.map((v) => v.id === vacanteACerrar.id ? { ...v, estado: 'CERRADA' } : v)
      );
      setVacanteACerrar(null);
    } catch (error) {
      alert("Error al cerrar la vacante en la base de datos.");
    } finally {
      setIsCerrando(false);
    }
  };

  const handleEditar = (id: string) => {
    router.push(`/job-postings?edit=${id}`);
  };

  const getBadgeStyle = (estado: string) => {
    switch(estado) {
      case 'ACTIVA': return { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' };
      case 'PAUSADA': return { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' };
      case 'CERRADA': return { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' };
      default: return { bg: '#f9fafb', color: '#9ca3af', dot: '#d1d5db' };
    }
  };

  const vacantesFiltradas = vacantes.filter(v => {
    const matchSearch = v.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    let matchTab = activeTab === 'Todas';
    if (activeTab === 'Activas') matchTab = v.estado === 'ACTIVA';
    if (activeTab === 'Pausadas') matchTab = v.estado === 'PAUSADA';
    if (activeTab === 'Cerradas') matchTab = v.estado === 'CERRADA';
    if (activeTab === 'Borradores') matchTab = v.estado === 'BORRADOR';
    const matchEstado = filterEstado === 'Todos' || v.estado === filterEstado;
    const matchModalidad = filterModalidad === 'Todas' || v.modalidad === filterModalidad;
    const matchNivel = filterNivel === 'Todos' || v.nivel === filterNivel;
    return matchSearch && matchTab && matchEstado && matchModalidad && matchNivel;
  });

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink)' }}>Cargando vacantes...</div>;

  return (
    <div style={{ backgroundColor: 'var(--palladian)', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Volver */}
        <Link href="/empresa" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver
        </Link>

        {/* HEADER — mismo layout, título más fuerte */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--flame)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 4px 12px rgba(255,177,98,0.35)' }}>
            <FolderOpen size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Mis vacantes publicadas
            </h1>
            <p style={{ color: 'var(--ink-70)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
              Gestiona tus ofertas activas y revisa su estado
            </p>
          </div>
        </div>

        {/* FILTROS — misma estructura, labels más marcados */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-70)' }} />
              <input 
                type="text" 
                placeholder="Buscar por título..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '0.5rem', border: '1.5px solid var(--oatmeal)', outline: 'none', fontSize: '0.875rem', color: 'var(--ink)', backgroundColor: '#fff' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ padding: '0.65rem 1rem', borderRadius: '0.5rem', border: '1.5px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontWeight: 500 }}>
              <option value="Todos">Todos</option>
              <option value="ACTIVA">Activa</option>
              <option value="PAUSADA">Pausada</option>
              <option value="CERRADA">Cerrada</option>
              <option value="BORRADOR">Borrador</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modalidad</label>
            <select value={filterModalidad} onChange={(e) => setFilterModalidad(e.target.value)} style={{ padding: '0.65rem 1rem', borderRadius: '0.5rem', border: '1.5px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontWeight: 500 }}>
              <option value="Todas">Todas</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nivel</label>
            <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)} style={{ padding: '0.65rem 1rem', borderRadius: '0.5rem', border: '1.5px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontWeight: 500 }}>
              <option value="Todos">Todos</option>
              <option value="Junior">Junior</option>
              <option value="Semi-Senior">Semi-Senior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>

        {/* TABS — mismo layout, activa más contrastada */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['Todas', 'Activas', 'Pausadas', 'Cerradas', 'Borradores'].map((tab) => {
            const isActive = activeTab === tab;
            let count = vacantes.length;
            if (tab === 'Activas') count = vacantes.filter(v => v.estado === 'ACTIVA').length;
            if (tab === 'Pausadas') count = vacantes.filter(v => v.estado === 'PAUSADA').length;
            if (tab === 'Cerradas') count = vacantes.filter(v => v.estado === 'CERRADA').length;
            if (tab === 'Borradores') count = vacantes.filter(v => v.estado === 'BORRADOR').length;
            
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.15rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--ink)' : '#fff', 
                  color: isActive ? '#fff' : 'var(--ink)',
                  border: isActive ? '2px solid var(--ink)' : '2px solid var(--oatmeal)',
                  boxShadow: isActive ? '0 4px 12px rgba(27,38,50,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tab === 'Todas' ? 'var(--flame)' : tab === 'Activas' ? '#22c55e' : tab === 'Pausadas' ? '#f59e0b' : tab === 'Cerradas' ? '#6b7280' : '#3b82f6' }}></div>
                {tab} <span style={{ opacity: 0.75, fontWeight: 500 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* TABLA — mismo layout, header más fuerte + hover */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid var(--oatmeal)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#f8f5f1', borderBottom: '2px solid var(--oatmeal)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', alignItems: 'center', borderRadius: '0.75rem 0.75rem 0 0' }}>
            <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>
            <div>Título</div>
            <div>Modalidad</div>
            <div>Nivel</div>
            <div>Estado</div>
            <div>Fecha</div>
            <div style={{ textAlign: 'center' }}>Acciones</div>
          </div>

          {vacantesFiltradas.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-70)' }}>
              No se encontraron vacantes que coincidan con los filtros.
            </div>
          ) : (
            vacantesFiltradas.map((vacante, index) => {
              const badge = getBadgeStyle(vacante.estado);
              const isLast = index === vacantesFiltradas.length - 1;
              return (
                <div 
                  key={vacante.id} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1fr 120px', 
                    gap: '1rem', 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: !isLast ? '1px solid #f3f4f6' : 'none', 
                    alignItems: 'center', 
                    fontSize: '0.875rem', 
                    borderRadius: isLast ? '0 0 0.75rem 0.75rem' : 0,
                    borderLeft: '4px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderLeftColor = 'var(--flame)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                >
                  
                  <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>

                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>{vacante.titulo}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-70)', marginTop: '0.25rem' }}>{vacante.tecnologias}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)', fontWeight: 500 }}>
                    {vacante.modalidad === 'Remoto' ? <Monitor size={16} /> : <MapPin size={16} />} {vacante.modalidad}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)', fontWeight: 500 }}>
                    <BarChart2 size={16} /> {vacante.nivel}
                  </div>

                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: badge.bg, color: badge.color, padding: '0.4rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: badge.dot }}></div>
                      {vacante.estado}
                    </span>
                  </div>

                  <div style={{ color: 'var(--ink-70)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
                    <Calendar size={15} /> {vacante.fecha_publicacion}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', position: 'relative' }}>
                    
                    <button style={{ border: '1.5px solid var(--oatmeal)', background: '#fff', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: 'var(--ink)', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--flame)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--flame)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--oatmeal)'; }}>
                      <Eye size={16} />
                    </button>
                    
                    <button onClick={() => handleEditar(vacante.id)} style={{ border: '1.5px solid var(--oatmeal)', background: '#fff', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: 'var(--ink)', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ink)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--oatmeal)'; }}>
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => setMenuAbierto(menuAbierto === vacante.id ? null : vacante.id)} style={{ border: '1.5px solid var(--oatmeal)', background: menuAbierto === vacante.id ? 'var(--ink)' : '#fff', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: menuAbierto === vacante.id ? '#fff' : 'var(--ink)', transition: 'all 0.15s' }}>
                      <MoreVertical size={16} />
                    </button>

                    {menuAbierto === vacante.id && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--oatmeal)', borderRadius: '0.5rem', padding: '0.5rem', width: '180px', zIndex: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.4rem', fontWeight: 500 }}><Eye size={14} /> Ver detalle</button>
                        <button onClick={() => handleEditar(vacante.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.4rem', fontWeight: 500 }}><Pencil size={14} /> Editar</button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.4rem', fontWeight: 500 }}><Pause size={14} /> Pausar</button>
                        
                        {vacante.estado === 'ACTIVA' && (
                          <button onClick={() => setVacanteACerrar(vacante)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: '#fef3c7', color: '#b45309', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, borderRadius: '0.4rem' }}><Ban size={14} /> Desactivar</button>
                        )}
                        
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: '#fef2f2', color: '#dc2626', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '0.4rem', fontWeight: 700 }}><Trash2 size={14} /> Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {vacanteACerrar && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(27, 38, 50, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', borderTop: '4px solid var(--flame)' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--ink)' }}>¿Cerrar vacante?</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--ink-70)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Estás a punto de cerrar la vacante <strong style={{ color: 'var(--ink)' }}>{vacanteACerrar.titulo}</strong>. Esta acción es irreversible.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setVacanteACerrar(null)} disabled={isCerrando} style={{ padding: '0.65rem 1.25rem', border: '1.5px solid var(--oatmeal)', backgroundColor: 'transparent', color: 'var(--ink)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button onClick={handleConfirmarCierre} disabled={isCerrando} style={{ padding: '0.65rem 1.25rem', border: 'none', backgroundColor: 'var(--flame)', color: 'var(--ink)', borderRadius: '0.5rem', cursor: isCerrando ? 'not-allowed' : 'pointer', opacity: isCerrando ? 0.7 : 1, fontWeight: 800 }}>
                  {isCerrando ? 'Cerrando...' : 'Sí, cerrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}