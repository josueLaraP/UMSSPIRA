"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Applicant } from "@/shared/types/applicant";
import {
  getApplicantsByVacancy,
  MATCH_ENGINE_ERROR_MESSAGE,
} from "@/shared/services/applicants";
import { useApplicantFilters } from "@/shared/hooks/useApplicantFilters";
import { MatchSlider } from "@/shared/components/match-slider";
import { MatchBreakdownView } from "@/shared/components/match-breakdown-view";
import { formatMatch, hasMatch } from "@/shared/utils/match-format";

export default function CandidatesPage() {
  const params = useParams();
  const vacancyId = (params?.id as string) || "vac-1";

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const data = await getApplicantsByVacancy(vacancyId);
        if (!cancelled) setApplicants(data);
      } catch {
        // CA-08 / CA-09: no se muestran datos de la petición fallida
        if (!cancelled) {
          setApplicants([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [vacancyId, reloadKey]);

  const {
    searchTerm,
    setSearchTerm,
    minMatch,
    setMinMatch,
    selectedStatus,
    setSelectedStatus,
    selectedLevel,
    setSelectedLevel,
    filteredApplicants,
    handleClearFilters,
  } = useApplicantFilters(applicants);

  // CA-06: estado de carga
  if (loading) {
    return (
      <div className="p-8 text-center text-[#1B2632] font-medium" role="status">
        Cargando candidatos...
      </div>
    );
  }

  // CA-08 / CA-09: error de conexión o del servidor
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4" role="alert">
        <p className="text-[#A35139] font-semibold">{MATCH_ENGINE_ERROR_MESSAGE}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#1B2632] rounded-lg hover:bg-opacity-90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // CA-07: la vacante no tiene postulantes
  if (applicants.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center text-gray-500">
        No existen postulantes para esta vacante.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {selectedApplicant ? (
        <MatchBreakdownView
          applicant={selectedApplicant}
          onBack={() => setSelectedApplicant(null)}
        />
      ) : (
        <>
          {/* Panel de Filtros */}
          <div className="bg-white p-6 rounded-xl border border-[#EEE9DF] shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EEE9DF]">
              <h1 className="text-lg font-bold text-[#1B2632]">
                Panel de Filtros de Postulantes
              </h1>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#A35139] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Buscar candidato por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
              />

              <MatchSlider value={minMatch} onChange={setMinMatch} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Postulado">Postulado</option>
                <option value="En revisión">En revisión</option>
                <option value="Entrevistado">Entrevistado</option>
                <option value="Descartado">Descartado</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
              >
                <option value="Todos">Todos los niveles</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          {/* Lista de Resultados */}
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-medium">
              Mostrando {filteredApplicants.length} de {applicants.length} postulantes
            </p>

            {filteredApplicants.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center border border-[#EEE9DF] text-gray-500">
                Ningún postulante cumple con los filtros aplicados.
              </div>
            ) : (
              filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-white p-5 rounded-xl border border-[#EEE9DF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                >
                  <div>
                    <h3 className="font-bold text-[#1B2632]">{applicant.name}</h3>
                    <p className="text-xs text-gray-500">{applicant.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-[#EEE9DF] rounded text-[#1B2632] font-medium">
                        {applicant.experienceLevel}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded font-medium">
                        {applicant.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* CA-02 / CA-05 / CA-10: valor recibido o "No disponible" */}
                    <div className="text-right">
                      <span
                        className={`font-bold ${
                          hasMatch(applicant.matchPercentage)
                            ? "text-lg text-[#FFB162]"
                            : "text-sm text-gray-500"
                        }`}
                      >
                        {formatMatch(applicant.matchPercentage)}
                      </span>
                      <p className="text-[10px] text-gray-500">Match Técnico</p>
                    </div>
                    <button
                      onClick={() => setSelectedApplicant(applicant)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#1B2632] rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}