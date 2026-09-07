"use client";

import React, { useState } from "react";
import { Layers, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface BaseTenBlocksProps {
  num1: number;
  num2: number;
  operation: "+" | "-" | "×" | "÷" | string;
}

/**
 * Komponen Kubus 3D Isometrik Satuan (1 Unit)
 */
function UnitCube3D({ size = 18 }: { size?: number }) {
  // Koordinat kubus isometrik
  // Lebar total = size, Tinggi total = size * 1.15
  const s = size;
  const h = s * 0.58;
  return (
    <svg
      width={s}
      height={s * 1.15}
      viewBox="0 0 100 115"
      className="inline-block transition-transform hover:-translate-y-1 duration-150 drop-shadow-sm"
    >
      {/* Sisi Atas (Top Face - Highlighted) */}
      <polygon points="50,0 100,25 50,50 0,25" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
      {/* Sisi Kiri (Left Face - Mid tone) */}
      <polygon points="0,25 50,50 50,105 0,80" fill="#EAB308" stroke="#CA8A04" strokeWidth="3" />
      {/* Sisi Kanan (Right Face - Shadow) */}
      <polygon points="50,50 100,25 100,80 50,105" fill="#CA8A04" stroke="#A16207" strokeWidth="3" />
    </svg>
  );
}

/**
 * Komponen Batang 3D Isometrik Puluhan (10 Units bertingkat)
 */
function TenRod3D() {
  return (
    <svg
      width={24}
      height={110}
      viewBox="0 0 60 260"
      className="inline-block transition-transform hover:-translate-y-1.5 duration-150 drop-shadow-md"
    >
      {/* Sisi Atas Batang */}
      <polygon points="30,0 60,15 30,30 0,15" fill="#86EFAC" stroke="#16A34A" strokeWidth="3" />

      {/* 10 Segmen Bertingkat dari atas ke bawah */}
      {Array.from({ length: 10 }).map((_, i) => {
        const yTop = 15 + i * 23;
        const yMid = 30 + i * 23;
        const yBottom = 38 + i * 23;
        return (
          <g key={i}>
            {/* Sisi Kiri */}
            <polygon
              points={`0,${yTop} 30,${yMid} 30,${yMid + 23} 0,${yTop + 23}`}
              fill={i % 2 === 0 ? "#4ADE80" : "#22C55E"}
              stroke="#15803D"
              strokeWidth="2.5"
            />
            {/* Sisi Kanan */}
            <polygon
              points={`30,${yMid} 60,${yTop} 60,${yTop + 23} 30,${yMid + 23}`}
              fill={i % 2 === 0 ? "#16A34A" : "#15803D"}
              stroke="#14532D"
              strokeWidth="2.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Komponen Lempengan 3D Isometrik Ratusan (10x10 = 100 Units)
 */
function HundredFlat3D() {
  return (
    <svg
      width={88}
      height={75}
      viewBox="0 0 200 170"
      className="inline-block transition-transform hover:-translate-y-1.5 duration-150 drop-shadow-md"
    >
      {/* Sisi Atas Lempeng (Grid 10x10) */}
      <polygon points="100,0 200,50 100,100 0,50" fill="#93C5FD" stroke="#2563EB" strokeWidth="4" />

      {/* Grid lines pada sisi atas */}
      {Array.from({ length: 9 }).map((_, i) => {
        const frac = (i + 1) / 10;
        // Garis diagonal 1
        const x1 = 100 * (1 - frac);
        const y1 = 50 * frac;
        const x2 = 200 - 100 * frac;
        const y2 = 50 + 50 * frac;

        // Garis diagonal 2
        const x3 = 100 + 100 * frac;
        const y3 = 50 * frac;
        const x4 = 100 * frac;
        const y4 = 100 - 50 * (1 - frac);

        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60A5FA" strokeWidth="1.5" />
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#60A5FA" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Ketebalan Sisi Kiri */}
      <polygon points="0,50 100,100 100,125 0,75" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
      {/* Ketebalan Sisi Kanan */}
      <polygon points="100,100 200,50 200,75 100,125" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="3" />
    </svg>
  );
}

/**
 * Komponen Balok Kubus 3D Isometrik Ribuan (1.000 Units)
 */
function ThousandCube3D() {
  return (
    <svg
      width={95}
      height={95}
      viewBox="0 0 200 200"
      className="inline-block transition-transform hover:-translate-y-2 duration-150 drop-shadow-lg"
    >
      {/* Sisi Atas */}
      <polygon points="100,10 190,55 100,100 10,55" fill="#D8B4FE" stroke="#7E22CE" strokeWidth="4" />
      {/* Sisi Kiri */}
      <polygon points="10,55 100,100 100,185 10,140" fill="#A855F7" stroke="#6B21A8" strokeWidth="4" />
      {/* Sisi Kanan */}
      <polygon points="100,100 190,55 190,140 100,185" fill="#7E22CE" stroke="#581C87" strokeWidth="4" />

      {/* Subdivisi grid visual di sisi depan dan atas */}
      <line x1="55" y1="77" x2="55" y2="162" stroke="#9333EA" strokeWidth="2" strokeDasharray="6 6" />
      <line x1="145" y1="77" x2="145" y2="162" stroke="#6B21A8" strokeWidth="2" strokeDasharray="6 6" />
      <line x1="10" y1="97" x2="100" y2="142" stroke="#9333EA" strokeWidth="2" strokeDasharray="6 6" />
      <line x1="100" y1="142" x2="190" y2="97" stroke="#6B21A8" strokeWidth="2" strokeDasharray="6 6" />

      {/* Label 1.000 */}
      <text x="100" y="55" textAnchor="middle" fill="#581C87" fontWeight="900" fontSize="24" fontFamily="sans-serif">
        1.000
      </text>
    </svg>
  );
}

export default function BaseTenBlocksVisualizer({
  num1,
  num2,
  operation,
}: BaseTenBlocksProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Dekomposisi nilai tempat
  const getDecomposition = (val: number) => {
    const u = val % 10;
    const t = Math.floor((val % 100) / 10);
    const h = Math.floor((val % 1000) / 100);
    const th = Math.floor((val % 10000) / 1000);
    return { th, h, t, u };
  };

  const d1 = getDecomposition(num1);
  const d2 = getDecomposition(num2);

  const getRegroupingTip = () => {
    if (operation === "+") {
      const sumU = d1.u + d2.u;
      if (sumU >= 10) {
        return `💡 Simpan (Regrouping): ${d1.u} balok satuan + ${d2.u} balok satuan = ${sumU} satuan. Sebanyak 10 satuan ditukar menjadi 1 batang puluhan simpanan (tersisa ${sumU % 10} satuan)!`;
      }
      return `Gabungkan balok sejenis: Hitung satuan bersama satuan, lalu batang puluhan bersama puluhan.`;
    }
    if (operation === "-") {
      if (d1.u < d2.u) {
        return `💡 Pinjam (Unbundling): Satuan angka atas (${d1.u}) lebih sedikit dari satuan bawah (${d2.u}). Pinjam 1 batang puluhan dari angka pertama dan bongkar menjadi 10 kubus satuan kecil!`;
      }
      return `Kurangkan balok angka pertama dengan jumlah balok pada angka kedua mulai dari kubus satuan.`;
    }
    return `Balok 3D menggambarkan besaran nilai tempat secara proporsional.`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-50/60 via-blue-50/40 to-emerald-50/60 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight font-fredoka flex items-center gap-1.5">
              Alat Bantu Visual Balok 3D Nilai Tempat
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Base-Ten 3D
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">
              Bantu pemahaman konsep hitung lewat balok kubus fisik 3D
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition"
          title={isOpen ? "Tutup Balok" : "Buka Balok"}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 flex flex-col gap-4">
          {/* Legenda Balok 3D */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600">
            <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Bentuk Balok:</span>
            <div className="flex items-center gap-2">
              <UnitCube3D size={16} />
              <span className="text-amber-800">Satuan (1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="scale-75 origin-left -my-4">
                <TenRod3D />
              </div>
              <span className="text-emerald-800">Puluhan (10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="scale-50 origin-left -my-3">
                <HundredFlat3D />
              </div>
              <span className="text-blue-800">Ratusan (100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="scale-50 origin-left -my-3">
                <ThousandCube3D />
              </div>
              <span className="text-purple-800">Ribuan (1.000)</span>
            </div>
          </div>

          {/* Tips Regrouping Edukatif */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs font-bold text-indigo-900 flex items-start gap-2">
            <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{getRegroupingTip()}</span>
          </div>

          {/* Grid Balok 3D Bilangan 1 & Bilangan 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BOX BILANGAN 1 */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                  Bilangan Pertama
                </span>
                <span className="text-lg font-black text-slate-900 bg-white px-3 py-0.5 rounded-xl border border-slate-200 font-fredoka shadow-2xs">
                  {num1}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 items-end min-h-[90px]">
                {d1.th > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-purple-700 mb-1">Ribuan ({d1.th})</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {Array.from({ length: d1.th }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <ThousandCube3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d1.h > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-blue-700 mb-1">Ratusan ({d1.h})</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {Array.from({ length: d1.h }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <HundredFlat3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d1.t > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-emerald-700 mb-1">Puluhan ({d1.t})</span>
                    <div className="flex flex-wrap gap-1.5 items-end">
                      {Array.from({ length: d1.t }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <TenRod3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d1.u > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-amber-700 mb-1">Satuan ({d1.u})</span>
                    <div className="flex flex-wrap gap-1.5 max-w-[120px] items-center p-1.5 bg-amber-50 rounded-xl border border-amber-200">
                      {Array.from({ length: d1.u }).map((_, i) => (
                        <UnitCube3D key={i} size={18} />
                      ))}
                    </div>
                  </div>
                )}

                {num1 === 0 && <span className="text-xs text-slate-400 italic">0 (Tidak ada balok)</span>}
              </div>
            </div>

            {/* BOX BILANGAN 2 */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                    {operation}
                  </span>
                  Bilangan Kedua
                </span>
                <span className="text-lg font-black text-slate-900 bg-white px-3 py-0.5 rounded-xl border border-slate-200 font-fredoka shadow-2xs">
                  {num2}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 items-end min-h-[90px]">
                {d2.th > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-purple-700 mb-1">Ribuan ({d2.th})</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {Array.from({ length: d2.th }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <ThousandCube3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d2.h > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-blue-700 mb-1">Ratusan ({d2.h})</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {Array.from({ length: d2.h }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <HundredFlat3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d2.t > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-emerald-700 mb-1">Puluhan ({d2.t})</span>
                    <div className="flex flex-wrap gap-1.5 items-end">
                      {Array.from({ length: d2.t }).map((_, i) => (
                        <div key={i} className="scale-90">
                          <TenRod3D />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d2.u > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-amber-700 mb-1">Satuan ({d2.u})</span>
                    <div className="flex flex-wrap gap-1.5 max-w-[120px] items-center p-1.5 bg-amber-50 rounded-xl border border-amber-200">
                      {Array.from({ length: d2.u }).map((_, i) => (
                        <UnitCube3D key={i} size={18} />
                      ))}
                    </div>
                  </div>
                )}

                {num2 === 0 && <span className="text-xs text-slate-400 italic">0 (Tidak ada balok)</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
