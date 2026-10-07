import React from "react";
import { Calculator, User } from "lucide-react";

interface WelcomeScreenProps {
  studentNameInput: string;
  setStudentNameInput: (val: string) => void;
  handleStartApp: () => void;
}

export default function WelcomeScreen({
  studentNameInput,
  setStudentNameInput,
  handleStartApp,
}: WelcomeScreenProps) {
  return (
    <div id="welcome-screen" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-100 rounded-full blur-2xl"></div>

        <div className="relative z-10 space-y-5">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg shadow-blue-500/20">
            <Calculator size={40} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Media Intervensi Berhitung
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2 font-fredoka">
              Selamat Datang di Math Board
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Papan Operasi Berbasis Nilai Tempat (Ribuan, Ratusan, Puluhan, Satuan)
            </p>
          </div>

          <div className="text-left space-y-2">
            <label htmlFor="student-name-input" className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Nama Siswa / Pengguna
            </label>
            <div className="relative">
              <User size={18} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="student-name-input"
                placeholder="Tuliskan nama Anda di sini..."
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleStartApp(); }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            onClick={handleStartApp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition duration-200 transform active:scale-95 text-base flex items-center justify-center gap-2"
          >
            Mulai Belajar 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
