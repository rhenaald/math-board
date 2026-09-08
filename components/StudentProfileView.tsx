"use client";

import React from "react";
import { CheckSquare, ArrowRight, Sparkles, BarChart2 } from "lucide-react";
import { BoyMascotVector } from "./ChildMascots";

interface StudentProfileViewProps {
  studentName: string;
  onStartRecommendedPractice: (op: "+" | "-" | "×" | "÷", combo?: string) => void;
  onBackToHome?: () => void;
}

export default function StudentProfileView({
  studentName = "Dika",
  onStartRecommendedPractice,
  onBackToHome,
}: StudentProfileViewProps) {
  const skills = [
    { name: "Nilai Tempat", status: "Baik", level: "85%", color: "bg-emerald-500", textCol: "text-emerald-700" },
    { name: "Penjumlahan", status: "Baik", level: "90%", color: "bg-emerald-500", textCol: "text-emerald-700" },
    { name: "Pengurangan", status: "Masih perlu latihan", level: "45%", color: "bg-amber-400", textCol: "text-amber-700" },
    { name: "Perkalian", status: "Baik", level: "80%", color: "bg-emerald-500", textCol: "text-emerald-700" },
    { name: "Pembagian", status: "Masih perlu latihan", level: "40%", color: "bg-amber-400", textCol: "text-amber-700" },
  ];

  const recommendations = [
    {
      id: "div-place",
      title: "Latihan Pembagian Nilai Tempat",
      desc: "Belajar membagi ratusan & puluhan bertahap",
      op: "÷" as const,
      combo: "R-S",
    },
    {
      id: "mult-tens",
      title: "Latihan 40 × 2, 50 × 2, 60 × 2",
      desc: "Menguasai perkalian puluhan dengan cepat",
      op: "×" as const,
      combo: "P-S",
    },
    {
      id: "sub-borrow",
      title: "Latihan Pengurangan Tukar 1 Puluhan",
      desc: "Memahami konsep menukar 1 puluhan menjadi 10 satuan",
      op: "-" as const,
      combo: "P-P",
    },
    {
      id: "visual-help",
      title: "Latihan Soal dengan Bantuan Visual Balok",
      desc: "Gunakan representasi balok untuk membuktikan hasil",
      op: "+" as const,
      combo: "P-P",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-in fade-in duration-300">
      {/* Top Banner Profil */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shadow-inner">
            👦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-fredoka tracking-wide">
                Profil Belajarku
              </h2>
              <span className="bg-amber-300 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                Level 2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold mt-1">
              Hai {studentName || "Siswa"}! Ini adalah peta kemajuan dan rekomendasi belajar untukmu hari ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] font-bold text-blue-200 block uppercase">Poin Bintang</span>
            <span className="text-xl font-black text-amber-300 font-fredoka flex items-center justify-center gap-1">
              ⭐ 120
            </span>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Kiri (Status Penguasaan Topik) & Kanan (Rekomendasi Latihan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Status Keterampilan */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-blue-600" size={20} />
              <h3 className="font-black text-slate-900 font-fredoka text-lg">
                Penguasaan Konsep
              </h3>
            </div>
            <span className="text-xs font-extrabold text-slate-400">Diperbarui Hari Ini</span>
          </div>

          <div className="flex flex-col gap-4">
            {skills.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800">{item.name}</span>
                  <span className={`font-black text-[11px] ${item.textCol}`}>
                    {item.status}
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: item.level }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Rekomendasi Adaptif & Maskot */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Card Rekomendasi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="text-amber-500" size={20} />
              <h3 className="font-black text-slate-900 font-fredoka text-lg">
                Rekomendasi Latihan Berikutnya
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onStartRecommendedPractice(rec.op, rec.combo)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-100/90 border border-sky-200/70 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckSquare size={18} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition">
                        {rec.title}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {rec.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 p-1.5 rounded-xl bg-white shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition text-slate-600"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Maskot Semangat */}
          <div className="bg-gradient-to-tr from-amber-100/80 via-yellow-50 to-orange-100/80 rounded-3xl p-5 border border-amber-200/70 shadow-xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-amber-900 font-fredoka">Pesan Semangat Hari Ini:</span>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                &quot;Terus berlatih, ya! Setiap langkah kecil adalah kemajuan besar untukmu!&quot;
              </p>
            </div>
            <div className="shrink-0 w-20 h-20 flex items-center justify-center">
              <BoyMascotVector size={76} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
