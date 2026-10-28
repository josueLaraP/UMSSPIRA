"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Applicant } from "@/shared/types/applicant";
import { getApplicantById } from "@/shared/services/applicants";
import { MatchBreakdownView } from "@/shared/components/match-breakdown-view";

export default function ApplicantMatchPage() {
  const params = useParams();
  const router = useRouter();
  const vacancyId = params?.id as string;
  const applicantId = params?.applicantId as string;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getApplicantById(vacancyId, applicantId);
      setApplicant(data);
      setLoading(false);
    }
    load();
  }, [vacancyId, applicantId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#1B2632] font-medium">
        Cargando candidato...
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontró al candidato.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <MatchBreakdownView applicant={applicant} onBack={() => router.back()} />
    </div>
  );
}