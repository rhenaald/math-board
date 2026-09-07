"use client";

import React, { useState } from "react";
import { X, Sparkles, ArrowRight, Layers, Lightbulb, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface ConceptLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBlocks: () => void;
}

export default function ConceptLearningModal({
  isOpen,
  onClose,
  onOpenBlocks,
}: ConceptLearningModalProps) {
  const [activeTab, setActiveTab] = useState<"satuan" | "puluhan" | "ratusan" | "simpan">("simpan");
  const [simUnitCount, setSimUnitCount] = useState<number>(8);
  const [simTenCount, setSimTenCount] = useState<number>(0);
  const [hasTransformed, setHasTransformed] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handler interaktif simulasi menambah kubus satuan
  const handleAddUnit = () => {
    if (simUnitCount < 9) {
      setSimUnitCount((prev) => prev + 1);
      setHasTransformed(false);
    } else if (simUnitCount === 9) {
      // Mencapai 10 -> Melebur menjadi 1 puluhan!
      setSimUnitCount(0);
      setSimTenCount((prev) => prev + 1);
      setHasTransformed(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log("confetti error", e);
      }
    }
  };

  const handleResetSimulation = () => {
    setSimUnitCount(8);
    setSimTenCount(0);
    setHasTransformed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-2xl w-full p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hiasan Latar Belakang */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER MODAL */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Konsep Dasar
                </span>
                <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                  <Sparkles size={13} /> Belajar Seru
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 font-fredoka tracking-tight mt-0.5">
                Nilai Tempat & Balok Dienes
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup Panduan"
          >
            <X size={20} />
          </button>
        </div>

        {/* TAB NAVIGASI */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-100 overflow-x-auto shrink-0 relative z-10">
          {[
            { id: "simpan" as const, label: "Simulasi Menyimpan (10 ➡️ 1)", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
            { id: "satuan" as const, label: "Satuan (S)", color: "text-amber-600 bg-amber-50 border-amber-200" },
            { id: "puluhan" as const, label: "Puluhan (P)", color: "text-blue-600 bg-blue-50 border-blue-200" },
            { id: "ratusan" as const, label: "Ratusan (R)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : `${tab.color} hover:brightness-95`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* KONTEN UTAMA MODAL */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 relative z-10 flex-1">
          {/* TAB 1: SIMULASI MENYIMPAN (ATURAN REGROUPING) */}
          {activeTab === "simpan" && (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={18} className="text-indigo-600" />
                  <h3 className="text-sm md:text-base font-black text-indigo-950 font-fredoka">
                    Aturan Ajaib Nilai Tempat: Setiap 10 Satuan Menjadi 1 Puluhan!
                  </h3>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  Di kolom satuan, angka maksimal hanyalah <strong>9</strong>. Begitu terkumpul <strong>10 kubus satuan</strong>, balok-balok tersebut melebur menjadi <strong>1 batang puluhan</strong> dan berpindah ke kolom puluhan di sebelah kirinya (inilah proses <em>menyimpan</em>).
                </p>
              </div>

              {/* AREA KOTAK SIMULASI INTERAKTIF */}
              <div className="bg-white rounded-2xl p-5 border-2 border-indigo-200 shadow-sm flex flex-col gap-4 items-center text-center">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-500 font-fredoka uppercase">
                    Kotak Simulasi Balok
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>

                {/* VISUALISASI BALOK DIENES INTERAKTIF */}
                <div className="flex flex-wrap items-center justify-center gap-6 py-3 w-full bg-slate-50/70 rounded-2xl border border-slate-200/60 min-h-[120px]">
                  {/* Bagian Batang Puluhan */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-black text-blue-700 font-fredoka">
                      Puluhan (Batang) = {simTenCount}
                    </span>
                    <div className="flex items-end gap-1.5 min-h-[60px] p-2 bg-blue-50/50 rounded-xl border border-blue-200/60 min-w-[70px] justify-center">
                      {simTenCount === 0 ? (
                        <span className="text-[11px] text-slate-400 font-semibold italic">Kosong</span>
                      ) : (
                        Array.from({ length: simTenCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-14 bg-gradient-to-t from-blue-600 to-sky-400 rounded-sm shadow-xs border border-blue-700 animate-in zoom-in-75 duration-300"
                            title="1 Batang Puluhan (10)"
                          ></div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tanda Panah Transformasi */}
                  <div className="flex flex-col items-center justify-center text-indigo-400">
                    <ArrowRight size={22} className="animate-pulse" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase">10 Satuan ➡️ 1 Puluhan</span>
                  </div>

                  {/* Bagian Kubus Satuan */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-black text-amber-700 font-fredoka">
                      Satuan (Kubus) = {simUnitCount} / 10
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-w-[150px] min-h-[60px] p-2 bg-amber-50/50 rounded-xl border border-amber-200/60 min-w-[100px] items-center justify-center">
                      {simUnitCount === 0 ? (
                        <span className="text-[11px] text-slate-400 font-semibold italic">0 Kubus</span>
                      ) : (
                        Array.from({ length: simUnitCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-xs shadow-2xs border border-amber-600 animate-in zoom-in-50 duration-150"
                            title="1 Kubus Satuan"
                          ></div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifikasi ketika berhasil melebur */}
                {hasTransformed && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 animate-bounce">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Hore! 10 Kubus Satuan melebur menjadi 1 Batang Puluhan! 🎉</span>
                  </div>
                )}

                {/* Tombol Interaktif Tambah Satuan */}
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-black font-fredoka text-xs shadow-md shadow-amber-500/30 transform hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <span>🟡</span>
                  <span>+ Tambah 1 Kubus Satuan ({simUnitCount}/10)</span>
                </button>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Klik tombol di atas sampai terisi 10 untuk melihat balok otomatis berubah menjadi puluhan!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SATUAN */}
          {activeTab === "satuan" && (
            <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-xs border border-amber-500">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-950 font-fredoka">
                    Satuan (S) = 1 Kubus Kecil
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Nilai tempat paling kanan pada bilangan.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-amber-100 flex flex-col gap-2 text-xs font-medium text-slate-700">
                <p>• <strong>Warna:</strong> Kuning Emas</p>
                <p>• <strong>Nilai:</strong> Setiap 1 kubus kecil bernilai tepat 1.</p>
                <p>• <strong>Contoh:</strong> Angka <strong>7</strong> diwakili oleh <strong>7 kubus satuan kuning</strong>.</p>
                <p>• <strong>Batas:</strong> Di kolom satuan hanya boleh menampung angka 0 sampai 9. Jika sampai 10, harus disimpan ke puluhan.</p>
              </div>
            </div>
          )}

          {/* TAB 3: PULUHAN */}
          {activeTab === "puluhan" && (
            <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                  10
                </div>
                <div>
                  <h3 className="text-base font-black text-blue-950 font-fredoka">
                    Puluhan (P) = 1 Batang Panjang
                  </h3>
                  <p className="text-xs text-blue-800 font-medium">
                    Nilai tempat di sebelah kiri Satuan.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-blue-100 flex flex-col gap-2 text-xs font-medium text-slate-700">
                <p>• <strong>Warna:</strong> Biru Langit</p>
                <p>• <strong>Nilai:</strong> 1 Batang Puluhan bernilai 10 (terbuat dari 10 kubus satuan yang menyatu).</p>
                <p>• <strong>Contoh:</strong> Angka <strong>45</strong> memiliki <strong>4 batang puluhan</strong> (40) dan <strong>5 kubus satuan</strong> (5).</p>
              </div>
            </div>
          )}

          {/* TAB 4: RATUSAN */}
          {activeTab === "ratusan" && (
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                  100
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-fredoka">
                    Ratusan (R) = 1 Lempeng Persegi
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium">
                    Nilai tempat di sebelah kiri Puluhan.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-emerald-100 flex flex-col gap-2 text-xs font-medium text-slate-700">
                <p>• <strong>Warna:</strong> Hijau Zamrud</p>
                <p>• <strong>Nilai:</strong> 1 Lempeng Ratusan bernilai 100 (terbuat dari 10 batang puluhan atau 100 kubus satuan).</p>
                <p>• <strong>Contoh:</strong> Angka <strong>235</strong> memiliki <strong>2 lempeng ratusan</strong> (200), <strong>3 batang puluhan</strong> (30), dan <strong>5 kubus satuan</strong> (5).</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER TOMBOL AKSI */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup Panduan
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBlocks();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black font-fredoka shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transform hover:scale-102 transition cursor-pointer"
          >
            <Layers size={16} />
            <span>Mulai Latihan dengan Balok 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
}
