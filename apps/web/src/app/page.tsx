import Link from "next/link";
import { Building2, Rocket } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4EE] p-6 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FFB162] opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#182632] opacity-10 rounded-full blur-3xl"></div>

      <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-[#E4DED3] relative z-10">
        <div className="mx-auto w-16 h-16 bg-[#182632] rounded-2xl flex items-center justify-center mb-6 shadow-md">
          <Rocket className="w-8 h-8 text-[#FFB162]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#182632] mb-2 tracking-tight">UMSSPIRA</h1>
        <p className="text-[#66717C] mb-8 text-sm">Prototipo Operativo • Épica 4</p>
        
        <Link 
          href="/companies"
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#FFB162] text-[#182632] text-sm font-bold tracking-wide rounded-xl hover:bg-[#FFA048] transition-all hover:scale-[1.02] shadow-sm"
        >
          <Building2 className="w-5 h-5" />
          Ingresar al Portal de Empresa
        </Link>
      </div>
    </main>
  );
}