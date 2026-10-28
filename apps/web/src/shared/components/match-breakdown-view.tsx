"use client";

import { useState } from "react";
import { Applicant } from "../types/applicant";
import {
  MATCH_UNAVAILABLE_LABEL,
  clampForDisplay,
  formatMatch,
  hasMatch,
} from "../utils/match-format";

type Tab = "perfil" | "coincidencia";

export function MatchBreakdownView({
  applicant,
  onBack,
}: {
  applicant: Applicant;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  const initials = applicant.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const matchAvailable = hasMatch(applicant.matchPercentage);
  const skills = applicant.skills ?? [];

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm font-semibold text-[#1B2632] hover:underline flex items-center gap-1"
        >
          ← Volver
        </button>
      )}

      {/* Cabecera del Candidato */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EEE9DF] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEE9DF] text-[#1B2632] font-bold flex items-center justify-center text-xl shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1B2632]">{applicant.name}</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {applicant.experienceLevel}
              </span>
            </div>
            <p className="text-sm text-gray-500">{applicant.email}</p>
            <p className="text-sm text-gray-500">{applicant.location}</p>
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-xl border ${
            matchAvailable
              ? "bg-emerald-50 border-emerald-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <span
            className={`text-lg font-bold ${
              matchAvailable ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            {formatMatch(applicant.matchPercentage)}
          </span>
          <p className="text-[11px] text-gray-500 font-medium">Coincidencia técnica</p>
        </div>
      </div>

      {/* Pestañas (CA-03). Para agregar más pestañas, añadir un botón y un bloque más. */}
      <div className="flex gap-2 border-b border-[#EEE9DF]" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "perfil"}
          onClick={() => setActiveTab("perfil")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
            activeTab === "perfil"
              ? "border-[#FFB162] text-[#1B2632]"
              : "border-transparent text-gray-500 hover:text-[#1B2632]"
          }`}
        >
          Perfil
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "coincidencia"}
          onClick={() => setActiveTab("coincidencia")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
            activeTab === "coincidencia"
              ? "border-[#FFB162] text-[#1B2632]"
              : "border-transparent text-gray-500 hover:text-[#1B2632]"
          }`}
        >
          Coincidencia técnica
        </button>
      </div>

      {/* Pestaña: Perfil */}
      {activeTab === "perfil" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EEE9DF] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#1B2632]">
          <div>
            <p className="text-xs text-gray-500">Correo</p>
            <p className="font-medium">{applicant.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="font-medium">{applicant.location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nivel de experiencia</p>
            <p className="font-medium">{applicant.experienceLevel}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Estado</p>
            <p className="font-medium">{applicant.status}</p>
          </div>
        </div>
      )}

      {/* Pestaña: Coincidencia técnica (CA-03, CA-04) */}
      {activeTab === "coincidencia" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EEE9DF]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dona con el porcentaje general recibido */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-bold text-[#1B2632] mb-4">
                Resultado de coincidencia técnica
              </h3>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {matchAvailable && (
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${clampForDisplay(applicant.matchPercentage as number)}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center text-center px-4">
                  <span
                    className={`font-bold ${
                      matchAvailable ? "text-2xl text-[#1B2632]" : "text-sm text-gray-500"
                    }`}
                  >
                    {formatMatch(applicant.matchPercentage)}
                  </span>
                </div>
              </div>
            </div>

            {/* Desglose por habilidad (valores tal cual los envía la API) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1B2632] mb-2">Desglose por habilidades</h3>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Desglose por habilidades: {MATCH_UNAVAILABLE_LABEL.toLowerCase()}.
                </p>
              ) : (
                skills.map((s) => (
                  <div key={s.skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#1B2632]">
                      <span>{s.skill}</span>
                      <span>{formatMatch(s.percentage)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${hasMatch(s.percentage) ? clampForDisplay(s.percentage) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}