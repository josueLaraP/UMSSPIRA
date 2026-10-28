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
      case 'ACTIVA': return { bg: '#dcfce7', color: '#166534', dot: '#22c55e' };
      case 'PAUSADA': return { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' };
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
        
        <Link href="/empresa" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Volver
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#fff', border: '1px solid var(--flame)', borderRadius: '0.75rem', color: 'var(--flame)' }}>
              <FolderOpen size={28} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--ink)', margin: 0 }}>Mis vacantes publicadas</h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-70)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por título" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', outline: 'none', fontSize: '0.875rem', color: 'var(--ink)' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
              <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none' }}>
                <option value="Todos">Todos</option>
                <option value="ACTIVA">Activa</option>
                <option value="PAUSADA">Pausada</option>
                <option value="CERRADA">Cerrada</option>
                <option value="BORRADOR">Borrador</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modalidad</label>
              <select value={filterModalidad} onChange={(e) => setFilterModalidad(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none' }}>
                <option value="Todas">Todas</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nivel</label>
              <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)', fontSize: '0.875rem', outline: 'none' }}>
                <option value="Todos">Todos</option>
                <option value="Junior">Junior</option>
                <option value="Semi-Senior">Semi-Senior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>
        </div>

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
                  padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: isActive ? '#fff' : 'transparent', 
                  color: isActive ? 'var(--ink)' : 'var(--ink-70)',
                  border: isActive ? '1px solid var(--oatmeal)' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'Todas' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--flame)' }}></div>}
                {tab !== 'Todas' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tab === 'Activas' ? '#22c55e' : tab === 'Pausadas' ? '#9ca3af' : tab === 'Cerradas' ? '#4b5563' : '#3b82f6' }}></div>}
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid var(--oatmeal)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--oatmeal)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink-70)', textTransform: 'uppercase', alignItems: 'center', borderRadius: '0.75rem 0.75rem 0 0' }}>
            <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>
            <div>Título</div>
            <div>Modalidad</div>
            <div>Nivel de experiencia</div>
            <div>Estado</div>
            <div>Fecha de publicación</div>
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
                <div key={vacante.id} style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: !isLast ? '1px solid #f3f4f6' : 'none', alignItems: 'center', fontSize: '0.875rem', borderRadius: isLast ? '0 0 0.75rem 0.75rem' : 0 }}>
                  
                  <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>

                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{vacante.titulo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-70)', marginTop: '0.25rem' }}>{vacante.tecnologias}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)' }}>
                    {vacante.modalidad === 'Remoto' ? <Monitor size={16} /> : <MapPin size={16} />} {vacante.modalidad}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-70)' }}>
                    <BarChart2 size={16} /> {vacante.nivel}
                  </div>

                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: badge.bg, color: badge.color, padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: badge.dot }}></div>
                      {vacante.estado}
                    </span>
                  </div>

                  <div style={{ color: 'var(--ink-70)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} /> {vacante.fecha_publicacion}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', position: 'relative' }}>
                    
                    <button style={{ border: '1px solid var(--oatmeal)', background: 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: 'var(--ink)' }}>
                      <Eye size={16} />
                    </button>
                    
                    <button onClick={() => handleEditar(vacante.id)} style={{ border: '1px solid var(--oatmeal)', background: 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: 'var(--ink)' }}>
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => setMenuAbierto(menuAbierto === vacante.id ? null : vacante.id)} style={{ border: '1px solid var(--oatmeal)', background: menuAbierto === vacante.id ? 'var(--palladian)' : 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: 'var(--ink)' }}>
                      <MoreVertical size={16} />
                    </button>

                    {menuAbierto === vacante.id && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--oatmeal)', borderRadius: '0.5rem', padding: '0.5rem', width: '170px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.3rem' }}><Eye size={14} /> Ver detalle</button>
                        <button onClick={() => handleEditar(vacante.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.3rem' }}><Pencil size={14} /> Editar</button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink)', borderRadius: '0.3rem' }}><Pause size={14} /> Pausar</button>
                        
                        {vacante.estado === 'ACTIVA' && (
                          <button onClick={() => setVacanteACerrar(vacante)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', color: 'var(--flame)', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '0.3rem' }}><Ban size={14} /> Desactivar</button>
                        )}
                        
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', color: '#dc2626', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '0.3rem' }}><Trash2 size={14} /> Eliminar</button>
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
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--ink)' }}>¿Cerrar vacante?</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--ink-70)', fontSize: '0.875rem' }}>
                Estás a punto de cerrar la vacante <strong>{vacanteACerrar.titulo}</strong>. Esta acción es irreversible.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setVacanteACerrar(null)} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: '1px solid var(--oatmeal)', backgroundColor: 'transparent', color: 'var(--ink)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                <button onClick={handleConfirmarCierre} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: 'var(--flame)', color: 'var(--ink)', borderRadius: '0.5rem', cursor: isCerrando ? 'not-allowed' : 'pointer', opacity: isCerrando ? 0.7 : 1, fontWeight: 'bold' }}>
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