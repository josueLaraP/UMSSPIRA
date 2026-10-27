'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, FolderOpen, Search, Eye, Pencil, MoreVertical, 
  Pause, Trash2, Monitor, MapPin, BarChart2 
} from 'lucide-react';

interface Vacante {
  id: string;
  titulo: string;
  tecnologias: string;
  modalidad: string;
  nivel: string;
  estado: 'ACTIVA' | 'PAUSADA' | 'CERRADA' | 'BORRADOR';
  fecha_publicacion: string;
}

export default function SandboxPage() {
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
        const response = await fetch('http://localhost:3000/api/v1/vacantes/mis-vacantes', {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        const data = await response.json();
        
        const formateadas = data.map((v: any) => ({
          id: v.id,
          titulo: v.titulo,
          tecnologias: v.descripcion_tecnica || 'Sin descripción', 
          modalidad: v.modalidad || 'No especificada',
          nivel: v.nivel_experiencia || 'No especificado',
          estado: v.estado || 'BORRADOR',
          fecha_publicacion: v.created_at ? new Date(v.created_at).toLocaleDateString('es-ES') : 'Sin fecha',
        }));

        setVacantes(formateadas);
      } catch (error) {
        console.error("Error al cargar de la BD:", error);
        // SI EL BACKEND FALLA (por el login), CARGAMOS MOCKS PARA VER EL DISEÑO
        setVacantes([
          { id: '1', titulo: 'Desarrollador Backend (Mock)', tecnologias: 'Python · Docker', modalidad: 'Remoto', nivel: 'Semi-Senior', estado: 'ACTIVA', fecha_publicacion: '10/09/2025' },
          { id: '2', titulo: 'Analista de Datos (Mock)', tecnologias: 'SQL · Power BI', modalidad: 'Híbrido', nivel: 'Junior', estado: 'PAUSADA', fecha_publicacion: '08/09/2025' },
        ]);
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
      const response = await fetch(`http://localhost:3000/api/v1/vacantes/${vacanteACerrar.id}/cerrar`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error');

      setVacantes((prev) => 
        prev.map((v) => v.id === vacanteACerrar.id ? { ...v, estado: 'CERRADA' } : v)
      );
      setVacanteACerrar(null);
    } catch (error) {
      alert("Error al cerrar (o no hay sesión). Se simulará el cierre.");
      setVacantes((prev) => 
        prev.map((v) => v.id === vacanteACerrar.id ? { ...v, estado: 'CERRADA' } : v)
      );
      setVacanteACerrar(null);
    } finally {
      setIsCerrando(false);
    }
  };

  const handleEditar = (id: string) => {
    alert(`Editar vacante con ID: ${id}`);
  };

  const getBadgeStyle = (estado: string) => {
    switch(estado) {
      case 'ACTIVA': return { bg: '#dcfce7', color: '#166534' };
      case 'PAUSADA': return { bg: '#f3f4f6', color: '#4b5563' };
      case 'CERRADA': return { bg: '#e5e7eb', color: '#374151' };
      default: return { bg: '#f9fafb', color: '#9ca3af' };
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

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--flame)', borderRadius: '0.5rem', color: 'var(--flame)' }}>
          <FolderOpen size={24} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--ink)', margin: 0 }}>Mis vacantes (Modo Sandbox)</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Buscar por título" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', outline: 'none' }} 
          />
        </div>
        
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)' }}>
          <option value="Todos">Estado</option>
          <option value="ACTIVA">Activa</option>
          <option value="PAUSADA">Pausada</option>
          <option value="CERRADA">Cerrada</option>
          <option value="BORRADOR">Borrador</option>
        </select>
        
        <select value={filterModalidad} onChange={(e) => setFilterModalidad(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)' }}>
          <option value="Todas">Modalidad</option>
          <option value="Remoto">Remoto</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Presencial">Presencial</option>
        </select>
        
        <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--oatmeal)', backgroundColor: '#fff', color: 'var(--ink)' }}>
          <option value="Todos">Nivel de experiencia</option>
          <option value="Junior">Junior</option>
          <option value="Semi-Senior">Semi-Senior</option>
          <option value="Senior">Senior</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
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
                padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                backgroundColor: isActive ? '#2d3748' : '#fff', color: isActive ? '#fff' : 'var(--ink)',
                border: isActive ? 'none' : '1px solid var(--oatmeal)'
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--oatmeal)', overflow: 'hidden' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--oatmeal)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink-70)', textTransform: 'uppercase' }}>
          <div>Título</div>
          <div>Modalidad</div>
          <div>Nivel de experiencia</div>
          <div>Estado</div>
          <div>Fecha de publicación</div>
          <div style={{ textAlign: 'center' }}>Acciones</div>
        </div>

        {vacantesFiltradas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-70)' }}>
            No se encontraron vacantes.
          </div>
        ) : (
          vacantesFiltradas.map((vacante, index) => {
            const badge = getBadgeStyle(vacante.estado);
            return (
              <div key={vacante.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: index !== vacantesFiltradas.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center', fontSize: '0.875rem' }}>
                
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{vacante.titulo}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>{vacante.tecnologias}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ink-70)' }}>
                  {vacante.modalidad === 'Remoto' ? <Monitor size={14} /> : <MapPin size={14} />} {vacante.modalidad}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ink-70)' }}>
                  <BarChart2 size={14} /> {vacante.nivel}
                </div>

                <div>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {vacante.estado}
                  </span>
                </div>

                <div style={{ color: 'var(--ink-70)' }}>{vacante.fecha_publicacion}</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', position: 'relative' }}>
                  
                  <button style={{ border: '1px solid #e5e7eb', background: 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#6b7280' }}>
                    <Eye size={16} />
                  </button>
                  
                  <button onClick={() => handleEditar(vacante.id)} style={{ border: '1px solid #e5e7eb', background: 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#6b7280' }}>
                    <Pencil size={16} />
                  </button>

                  <button onClick={() => setMenuAbierto(menuAbierto === vacante.id ? null : vacante.id)} style={{ border: '1px solid #e5e7eb', background: menuAbierto === vacante.id ? '#f3f4f6' : 'none', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#6b7280' }}>
                    <MoreVertical size={16} />
                  </button>

                  {menuAbierto === vacante.id && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--oatmeal)', borderRadius: '0.5rem', padding: '0.5rem', width: '150px', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem' }}><Eye size={14} /> Ver detalle</button>
                      <button onClick={() => handleEditar(vacante.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.8rem' }}><Pencil size={14} /> Editar</button>
                      
                      {vacante.estado === 'ACTIVA' && (
                        <button onClick={() => setVacanteACerrar(vacante)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '0.3rem', width: '100%', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}><Trash2 size={14} /> Desactivar</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {vacanteACerrar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--ink)' }}>¿Cerrar vacante?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--ink-70)' }}>
              Estás a punto de cerrar la vacante <strong>{vacanteACerrar.titulo}</strong>. Esta acción es irreversible.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setVacanteACerrar(null)} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: '1px solid var(--oatmeal)', backgroundColor: 'transparent', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmarCierre} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#dc2626', color: '#fff', borderRadius: '0.5rem', cursor: isCerrando ? 'not-allowed' : 'pointer', opacity: isCerrando ? 0.7 : 1 }}>
                {isCerrando ? 'Cerrando...' : 'Sí, cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}