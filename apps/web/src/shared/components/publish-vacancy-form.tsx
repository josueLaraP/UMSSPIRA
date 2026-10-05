"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  MapPin,
  ArrowLeft,
  User,
  Flame,
  CheckCircle
} from "lucide-react";
import { CompanyDropdown } from "./company-dropdown";
interface VacancyFormData {
  title: string;
  modality: string;
  experienceLevel: string;
  technicalDescription: string;
}

const initialFormData: VacancyFormData = {
  title: "",
  modality: "",
  experienceLevel: "",
  technicalDescription: "",
};

export function PublishVacancyForm() {
  const [formData, setFormData] = useState<VacancyFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // CA13 y CA14: Dispara la validación y colores al quitar el foco del campo
  const handleBlur = (field: keyof VacancyFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: keyof VacancyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // CA1, CA4, CA5, CA6, CA7: Lógica central de validaciones
  const validateField = (field: string, value: string) => {
    let error = "";
    const trimmedValue = value.trim();

    switch (field) {
      case "title":
        if (!trimmedValue) error = "El título es obligatorio.";
        else if (trimmedValue.length > 100) error = "El título no puede exceder los 100 caracteres.";
        break;
      case "modality":
        if (!trimmedValue) error = "Debes seleccionar una modalidad.";
        break;
      case "experienceLevel":
        if (!trimmedValue) error = "Debes seleccionar un nivel de experiencia.";
        break;
      case "technicalDescription":
        if (!trimmedValue) error = "La descripción técnica es obligatoria.";
        else if (trimmedValue.length < 50) error = "La descripción debe tener al menos 50 caracteres.";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  // CA8: Validar todo al mismo tiempo al presionar "Publicar"
  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    newErrors.title = validateField("title", formData.title);
    newErrors.modality = validateField("modality", formData.modality);
    newErrors.experienceLevel = validateField("experienceLevel", formData.experienceLevel);
    newErrors.technicalDescription = validateField("technicalDescription", formData.technicalDescription);

    // Marca todos como tocados para que se vean los bordes rojos si están vacíos
    setTouched({
      title: true,
      modality: true,
      experienceLevel: true,
      technicalDescription: true,
    });

    return Object.values(newErrors).every((err) => err === "");
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setMessage("");
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    setIsSuccess(false);
    setMessage("");

    // OMITIMOS LA VERIFICACIÓN DE SESIÓN (CA15) PARA LA PRESENTACIÓN
    // Validamos todos los campos directamente
    if (!validateAll()) {
      setMessage("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      setLoading(true); // CA10: Deshabilita el botón temporalmente

      // CA2: Simulación de guardado en la base de datos (1.5s de latencia)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // CA9: Persistencia en LocalStorage para mostrar en otras vistas
      const newVacancy = {
        id: crypto.randomUUID(),
        titulo: formData.title.trim(),
        modalidad: formData.modality,
        nivelExperiencia: formData.experienceLevel,
        descripcionTecnica: formData.technicalDescription.trim(),
        estado: 'PUBLICADO',
        fechaCreacion: new Date().toISOString(),
        empresaId: 'empresa-mock-1' 
      };
      
      const existingVacancies = JSON.parse(localStorage.getItem('mock_vacantes') || '[]');
      localStorage.setItem('mock_vacantes', JSON.stringify([newVacancy, ...existingVacancies]));

      // CA3: Limpieza y confirmación de publicación
      setIsSuccess(true);
      setMessage("Vacante publicada correctamente ✅");
      setFormData(initialFormData);
      setErrors({});
      setTouched({});

    } catch (error) {
      // CA11: Error al publicar
      setIsSuccess(false);
      setMessage("Ocurrió un error inesperado de conexión. Conservamos tus datos para reintentar.");
    } finally {
      setLoading(false);
    }
  };
  // Función para determinar el color del borde dinámicamente
  const getInputClass = (field: keyof VacancyFormData) => {
    const base = "h-11 w-full rounded-lg bg-white pl-10 pr-3 text-sm text-[#182632] outline-none transition focus:ring-1 ";
    if (!touched[field]) return base + "border border-[#E4DED3] focus:border-[#FFB162] focus:ring-[#FFB162]";
    if (errors[field]) return base + "border-2 border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20"; // CA13
    return base + "border-2 border-green-500 focus:border-green-500 focus:ring-green-500"; // CA14
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE]">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        
       {/* Cabecera temporal: Botón Volver + Avatar */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/companies" className="flex items-center text-sm font-bold text-[#182632] hover:text-[#D97720] transition-colors w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Link>
          
          {/* Aquí va tu componente estrella */}
          <CompanyDropdown />
        </div>

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1E3] text-[#D97720] shadow-sm">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-wider text-[#D97720] uppercase mb-0.5">
                Bolsa de trabajo
              </span>
              <h1 className="text-2xl font-bold text-[#182632]">
                Publicar una vacante
              </h1>
            </div>
          </div>
          <p className="ml-[64px] text-sm text-[#66717C]">
            Completa la información de la vacante para que los candidatos conozcan mejor el perfil que buscas.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-[#E4DED3] bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* CA3, CA4: Título */}
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-semibold text-[#182632]">
                    Título <span className="text-[#A35139]">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center font-bold text-[#8A929A]">T</span>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      maxLength={100}
                      value={formData.title}
                      onBlur={() => handleBlur("title")}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Ej. Desarrollador Backend"
                      className={getInputClass("title")}
                    />
                  </div>
                  {errors.title ? (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.title}</p>
                  ) : (
                    <p className="text-[11px] text-[#8A929A] mt-1">Sé claro y específico para atraer al talento adecuado.</p>
                  )}
                </div>

                {/* CA3, CA5, CA6, CA7: Modalidad */}
                <div>
                  <label htmlFor="modality" className="mb-2 block text-sm font-semibold text-[#182632]">
                    Modalidad <span className="text-[#A35139]">*</span>
                  </label>
                  <div className="relative">
                    <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8A929A]" />
                    <select
                      id="modality"
                      name="modality"
                      value={formData.modality}
                      onBlur={() => handleBlur("modality")}
                      onChange={(e) => handleChange("modality", e.target.value)}
                      className={`${getInputClass("modality")} appearance-none pr-9 cursor-pointer`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="HIBRIDO">Híbrido</option>
                      <option value="REMOTO">Remoto</option>
                    </select>
                  </div>
                  {errors.modality && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.modality}</p>}
                </div>
              </div>

              {/* CA3, CA8, CA9, CA10: Nivel Experiencia */}
              <div>
                <label htmlFor="experienceLevel" className="mb-2 block text-sm font-semibold text-[#182632]">
                  Nivel de experiencia <span className="text-[#A35139]">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8A929A]" />
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onBlur={() => handleBlur("experienceLevel")}
                    onChange={(e) => handleChange("experienceLevel", e.target.value)}
                    className={`${getInputClass("experienceLevel")} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SIN_EXPERIENCIA">Sin experiencia</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="SEMI_SENIOR">Semi Senior</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>
                {errors.experienceLevel && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.experienceLevel}</p>}
              </div>

              {/* CA3, CA11, CA12: Descripción técnica */}
              <div>
                <label htmlFor="technicalDescription" className="mb-2 block text-sm font-semibold text-[#182632]">
                  Descripción técnica <span className="text-[#A35139]">*</span>
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#8A929A]" />
                  <textarea
                    id="technicalDescription"
                    name="technicalDescription"
                    rows={5}
                    maxLength={2000}
                    value={formData.technicalDescription}
                    onBlur={() => handleBlur("technicalDescription")}
                    onChange={(e) => handleChange("technicalDescription", e.target.value)}
                    placeholder="Describe las responsabilidades, requisitos y demás detalles técnicos del puesto..."
                    className={`w-full resize-none py-3 pl-10 pr-3 leading-6 placeholder:text-[#8A929A] ${getInputClass("technicalDescription").replace("h-11", "")}`}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {errors.technicalDescription ? (
                    <p className="text-[11px] text-red-500 font-medium">{errors.technicalDescription}</p>
                  ) : (
                    <span />
                  )}
                  <p className={`text-[11px] font-medium ${formData.technicalDescription.length >= 2000 ? 'text-red-500' : 'text-[#8A929A]'}`}>
                    {formData.technicalDescription.length}/2000
                  </p>
                </div>
              </div>

              {/* Mensajes de feedback (Error o Éxito) */}
              {message && (
                <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${isSuccess ? 'bg-green-50 text-green-800 border-green-200' : 'bg-[#FFF8EE] text-[#182632] border-[#E4DED3]'}`}>
                  {isSuccess ? <CheckCircle className="w-5 h-5 text-green-600"/> : null}
                  {message}
                </div>
              )}

              {/* CA16: Botones de Acción */}
              <div className="flex items-center justify-end gap-3 border-t border-[#E4DED3] pt-5">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  disabled={loading} 
                  className="h-11 rounded-lg border border-[#E4DED3] bg-[#F7F4EE] px-6 text-sm font-semibold text-[#182632] hover:bg-[#E4DED3] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="h-11 rounded-lg bg-[#E87B1E] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#D46B18] focus:ring-2 focus:ring-[#E87B1E] disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
                       Publicando...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 fill-current" /> Publicar vacante
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* CA13, CA14 (HU5): Panel Lateral de Consejos */}
          <aside className="rounded-2xl border border-[#E4DED3] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1E3] text-[#D97720]">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="font-bold text-[#182632] text-lg text-center leading-tight">
                Consejos para una buena publicación
              </h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <Tip text="Usa un título claro y directo." />
              <Tip text="Selecciona la modalidad y nivel de experiencia correcto." />
              <Tip text="Describe las funciones y requisitos técnicos con detalle." />
              <Tip text="Destaca lo que hace única a tu empresa." />
            </div>

            <div className="rounded-xl bg-[#FFF8EE] border border-[#F2D8B8] p-4">
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#D97720]" />
                <p className="text-xs leading-5 text-[#59636D]">
                  Una buena descripción ayuda a atraer a candidatos que realmente se ajusten a tu necesidad.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D97720] fill-[#D97720]" />
      <p className="text-sm leading-5 text-[#59636D]">{text}</p>
    </div>
  );
}