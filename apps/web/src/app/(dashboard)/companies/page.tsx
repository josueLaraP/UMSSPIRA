'use client';

import { useState } from 'react';
import type { Company, UpdateCompanyPayload } from '@umsspira/shared-types';
import { ArrowLeft } from 'lucide-react'; // Importamos el icono para el botón volver

import { CompanyDetails } from './company-details';
import { CompanyHeader } from './company-header';
import { EditCompanyForm } from '@/shared/components/edit-company-form';
import { CompanyDropdown } from '@/shared/components/company-dropdown';
const companyMock: Company = {
  id: '1',
  nombre: 'TechSolutions S.A.',
  nit: '1023456019',
  descripcion:
    'Somos una empresa de tecnología enfocada en desarrollar soluciones de software que impulsan la transformación digital de nuestros clientes. Contamos con más de 15 años de experiencia en el mercado.',
  telefono: '+591 71234567',
  correo: 'contacto@techsolutions.com',
  sitioWeb: 'https://www.techsolutions.com',
  direccion: 'Av. San Martin y Costanera, Piso 12, Cochabamba, Bolivia',
  tamano: '50 - 200 empleados',
  eslogan: 'Innovación tecnológica para un mejor futuro.',
};

export default function CompaniesPage() {
  const [company, setCompany] = useState<Company>(companyMock);
  const [isEditing, setIsEditing] = useState(false);

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSubmit(data: UpdateCompanyPayload): Promise<void> {
    setCompany((currentCompany) => ({
      ...currentCompany,
      ...data,
    }));
    // Después de guardar, cerramos el formulario automáticamente
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#EEE9DF] p-6 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Banner siempre visible como en el mockup */}
          <CompanyHeader 
            companyName={company.nombre} 
            companySlogan={company.eslogan}
          />
          
          <div>
            {/* Botón Volver */}
            <button 
              onClick={handleCancel}
              className="flex items-center text-sm font-semibold text-[#182632] hover:text-[#A35139] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </button>
            
            {/* Pestaña "Información general" */}
            <div className="border-b border-[#C9C1B1] mb-6">
              <span className="inline-block border-b-2 border-[#A35139] text-[#182632] font-semibold text-sm pb-2 px-1">
                Información general
              </span>
            </div>

            <EditCompanyForm
              company={company}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-end w-full">
          <CompanyDropdown 
            companyName={company.nombre} 
            companyRole="Empresa empleadora" 
          />
        </div>
        {/* Componente HU-02: Banner y Encabezado de la empresa actualizado */}
        <CompanyHeader 
          companyName={company.nombre} 
          companySlogan={company.eslogan}
        />
        
        {/* Componente HU-03: Detalles, Descripcion y Contacto */}
        <CompanyDetails
          description={company.descripcion}
          taxId={company.nit}
          companySize={company.tamano}
          address={company.direccion}
          email={company.correo}
          phone={company.telefono}
          website={company.sitioWeb}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}