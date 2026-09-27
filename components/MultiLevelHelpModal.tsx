"use client";

import React, { useState } from "react";
import { X, HelpCircle, Eye, BookOpen, CheckCircle, RotateCcw, ArrowRight } from "lucide-react";

interface MultiLevelHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: "+" | "-" | "×" | "÷";
  num1: number;
  num2: number;
  initialLevel?: 1 | 2 | 3 | 4;
  onTryAgain?: () => void;
}

export default function MultiLevelHelpModal({
  isOpen,
  onClose,
  operation,
  num1,
  num2,
  initialLevel = 1,
  onTryAgain,
}: MultiLevelHelpModalProps) {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4>(initialLevel);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveLevel(initialLevel);
    }
  }

  if (!isOpen) return null;

  const u1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const h1 = Math.floor((num1 % 1000) / 100);

  const u2 = num2 % 10;
  const t2 = Math.floor((num2 % 100) / 10);

  // Render Visual Content dynamically for all 4 operations across all 4 levels
  const renderVisualContent = () => {
    // -----------------------------------------------------------------------
    // 1. PERKALIAN (×)
    // -----------------------------------------------------------------------
    if (operation === "×") {
      const tens = t1 > 0 ? t1 : Math.floor(num1 / 10);
      const units = u1;

      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
            {num1} × {num2} = ?
          </div>

          {activeLevel === 1 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-slate-700 text-xs sm:text-sm w-full space-y-2">
              <p className="font-black text-blue-900 flex items-center gap-1.5">
                <span>💡 Bantuan Level 1 – Petunjuk Awal:</span>
              </p>
              <p>
                Perhatikan nilai tempat dari bilangan <strong>{num1}</strong>! 
                {h1 > 0 ? ` ${h1} ratusan,` : ""} {tens > 0 ? ` ${tens} puluhan,` : ""} dan {units} satuan.
              </p>
              <p className="font-semibold text-blue-800">
                Pecah dulu bilangannya agar perkaliannya menjadi jauh lebih mudah dihitung secara terpisah.
              </p>
            </div>
          )}

          {activeLevel === 2 && (
            <div className="flex flex-col items-center gap-3 w-full bg-emerald-50/70 border border-emerald-200/80 p-4 sm:p-5 rounded-3xl">
              <p className="text-xs sm:text-sm font-black text-emerald-900">
                📦 Bantuan Level 2 – Representasi Visual:
              </p>
              <p className="text-xs text-emerald-800 font-bold">
                Coba perhatikan! {num1 >= 10 ? `${num1} memiliki ${tens} puluhan (${tens * 10})` : `${num1} satuan`}:
              </p>

              {/* Visual Balok Batang Puluhan */}
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                {Array.from({ length: Math.min(tens || 4, 8) }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-0.5" title="1 batang = 10">
                    <div className="w-5 h-20 bg-emerald-500 rounded-md flex flex-col justify-between p-0.5 border border-emerald-600 shadow-2xs">
                      {Array.from({ length: 10 }).map((_, cellIdx) => (
                        <div key={cellIdx} className="w-full h-1.5 bg-emerald-400/60 rounded-2xs" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-emerald-700">10</span>
                  </div>
                ))}
              </div>

              <p className="text-xs font-black text-emerald-800 text-center">
                Jadi, {tens * 10} × {num2} = {tens * 10 * num2} {units > 0 ? `dan ${units} × ${num2} = ${units * num2}` : ""}.
              </p>
            </div>
          )}

          {activeLevel === 3 && (
            <div className="flex flex-col gap-3 w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-slate-700 text-xs sm:text-sm">
              <p className="font-black text-amber-900">📝 Bantuan Level 3 – Penjelasan Langkah Terurai:</p>
              <ol className="list-decimal pl-5 space-y-1.5 font-medium">
                {h1 > 0 && <li>Kalikan ratusan: {h1 * 100} × {num2} = {h1 * 100 * num2}.</li>}
                {tens > 0 && <li>Kalikan puluhan: {tens * 10} × {num2} = {tens * 10 * num2}.</li>}
                {units > 0 && <li>Kalikan satuan: {units} × {num2} = {units * num2}.</li>}
                <li className="font-bold text-amber-950">
                  Jumlahkan semuanya: {h1 > 0 ? `${h1 * 100 * num2} + ` : ""}{tens * 10 * num2} + {units * num2} = {num1 * num2}.
                </li>
              </ol>
            </div>
          )}

          {activeLevel === 4 && (
            <div className="flex flex-col gap-3 w-full bg-purple-50 border border-purple-200 p-4 rounded-2xl text-slate-700 text-xs sm:text-sm">
              <p className="font-black text-purple-900">🎯 Bantuan Level 4 – Contoh Lengkap & Jawaban:</p>
              <div className="p-3 bg-white rounded-xl border border-purple-100 font-mono text-center text-sm font-black text-purple-800 leading-relaxed">
                {num1} × {num2} = ({tens * 10} × {num2}) + ({units} × {num2})<br/>
                = {tens * 10 * num2} + {units * num2}<br/>
                = <span className="text-rose-600 text-base">{num1 * num2}</span>
              </div>
              <p className="text-xs text-purple-900 font-semibold text-center">
                Hebat! Sekarang kamu sudah memahami polanya, yuk klik &quot;Coba Lagi&quot; untuk mengerjakannya sendiri!
              </p>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // 2. PEMBAGIAN (÷)
    // -----------------------------------------------------------------------
    if (operation === "÷") {
      const quotientStr = (num1 / num2).toString().replace(".", ",");

      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
            {num1} ÷ {num2} = ?
          </div>

          {activeLevel === 1 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-slate-700 text-xs sm:text-sm w-full space-y-2">
              <p className="font-black text-blue-900">💡 Bantuan Level 1 – Konsep Pengurangan Berulang:</p>
              <p>
                Pembagian pada hakikatnya adalah <strong>pengurangan berulang</strong> sampai habis atau tidak bisa dikurangi lagi.
              </p>
              <p className="font-semibold text-blue-800">
                Susun ke kurung porogapit: tulis {num2} di luar dan {num1} di dalam kurung.
              </p>
            </div>
          )}

          {activeLevel === 2 && (
            <div className="flex flex-col items-center gap-3 w-full bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl">
              <p className="text-xs sm:text-sm font-black text-emerald-900">
                📦 Bantuan Level 2 – Tangga Pengurangan Berulang Porogapit:
              </p>
              <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-center text-xs font-mono font-bold text-emerald-900 w-full max-w-sm">
                <p className="text-slate-500 font-sans text-[11px] mb-1">Kurangkan bertingkat:</p>
                <p>Ambil kelompok angka &ge; {num2}</p>
                <p>Kurangkan dengan {num2} terus-menerus!</p>
                <p className="text-purple-700 font-black mt-1">Hitung berapa kali pengurangan = Digit hasil bagi!</p>
              </div>
              <p className="text-xs font-bold text-emerald-800 text-center">
                Jika sisa angka habis tetapi masih ada sisa, beri koma (,) di atas dan pinjam 0.
              </p>
            </div>
          )}

          {activeLevel === 3 && (
            <div className="flex flex-col gap-2.5 w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs sm:text-sm text-slate-800">
              <p className="font-black text-amber-900">📝 Bantuan Level 3 – Penjelasan Langkah Terurai:</p>
              <ol className="list-decimal pl-5 space-y-1 font-medium">
                <li>Ambil digit awal dari bilangan {num1} yang cukup dikurangi dengan {num2}.</li>
                <li>Lakukan pengurangan bertingkat dengan angka {num2} sampai sisanya &lt; {num2}.</li>
                <li>Tuliskan jumlah kali pengurangan sebagai digit hasil di atas kurung porogapit.</li>
                <li>Turunkan digit berikutnya dari {num1} atau beri tanda koma (,) dan tambahkan 0 jika desimal.</li>
              </ol>
            </div>
          )}

          {activeLevel === 4 && (
            <div className="flex flex-col gap-2 w-full bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs sm:text-sm">
              <p className="font-black text-purple-900">🎯 Bantuan Level 4 – Contoh Lengkap & Cek Balik:</p>
              <p>Hasil pembagian dari {num1} ÷ {num2} adalah <strong>{quotientStr}</strong>.</p>
              <p className="font-mono font-black text-purple-800 text-center py-2.5 bg-white rounded-xl border border-purple-100 text-sm">
                Cek Balik: {quotientStr} × {num2} = {num1} (Terbukti Benar!)
              </p>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // 3. PENGURANGAN (-)
    // -----------------------------------------------------------------------
    if (operation === "-") {
      const isBorrowNeeded = u1 < u2;

      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
            {num1} − {num2} = ?
          </div>

          {activeLevel === 1 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 w-full space-y-2">
              <p className="font-black text-orange-900">💡 Bantuan Level 1 – Petunjuk Awal:</p>
              <p>Periksa kolom <strong>Satuan</strong> terlebih dahulu: apakah <strong>{u1}</strong> cukup dikurangi <strong>{u2}</strong>?</p>
              {isBorrowNeeded ? (
                <p className="font-bold text-rose-700">
                  Karena {u1} &lt; {u2}, kita harus menukar 1 puluhan dari angka {num1} menjadi 10 satuan!
                </p>
              ) : (
                <p className="font-bold text-emerald-700">
                  Karena {u1} &ge; {u2}, kamu bisa langsung mengurangkan satuan terlebih dahulu.
                </p>
              )}
            </div>
          )}

          {activeLevel === 2 && (
            <div className="flex flex-col gap-3 w-full bg-rose-50/80 border border-rose-200 p-4 rounded-2xl text-xs sm:text-sm">
              <p className="font-black text-rose-900">📦 Bantuan Level 2 – Tabel Balok Sebelum vs Sesudah Ditukar:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white rounded-xl border border-rose-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Sebelum Ditukar</span>
                  <span className="text-xs font-black text-slate-800">{t1} puluhan + {u1} satuan</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{num1} = {t1 * 10} + {u1}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-300 text-center ring-1 ring-emerald-300">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block">Setelah Ditukar</span>
                  <span className="text-xs font-black text-emerald-800">{t1 - 1} puluhan + {u1 + 10} satuan</span>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">{num1} = {(t1 - 1) * 10} + {u1 + 10}</span>
                </div>
              </div>
            </div>
          )}

          {activeLevel === 3 && (
            <div className="flex flex-col gap-2 w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs sm:text-sm">
              <p className="font-black text-amber-900">📝 Bantuan Level 3 – Penjelasan Langkah Terurai:</p>
              <ol className="list-decimal pl-5 space-y-1.5 font-medium text-slate-700">
                {isBorrowNeeded ? (
                  <>
                    <li>Kurangkan satuan: ({u1} + 10) − {u2} = {u1 + 10 - u2}.</li>
                    <li>Kurangkan puluhan yang tersisa: ({t1} − 1) − {t2} = {t1 - 1 - t2}.</li>
                  </>
                ) : (
                  <>
                    <li>Kurangkan satuan: {u1} − {u2} = {u1 - u2}.</li>
                    <li>Kurangkan puluhan: {t1} − {t2} = {t1 - t2}.</li>
                  </>
                )}
                <li className="font-bold text-amber-950">
                  Hasil akhir: {(num1 - num2)}
                </li>
              </ol>
            </div>
          )}

          {activeLevel === 4 && (
            <div className="flex flex-col gap-2 w-full bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs sm:text-sm">
              <p className="font-black text-purple-900">🎯 Bantuan Level 4 – Contoh Lengkap & Cek Balik:</p>
              <div className="p-3 bg-white rounded-xl border border-purple-100 text-center font-mono font-black text-purple-800 text-sm">
                {num1} − {num2} = <span className="text-rose-600">{num1 - num2}</span>
              </div>
              <p className="text-xs text-purple-900 font-semibold text-center">
                Cek Balik: {num1 - num2} + {num2} = {num1} (Terbukti Benar!)
              </p>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // 4. PENJUMLAHAN (+) (Default)
    // -----------------------------------------------------------------------
    const isCarry = u1 + u2 >= 10;
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
          {num1} + {num2} = ?
        </div>

        {activeLevel === 1 && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-slate-700 text-xs sm:text-sm w-full space-y-2">
            <p className="font-black text-emerald-900">💡 Bantuan Level 1 – Petunjuk Awal:</p>
            <p>1. Susun angka pada tabel nilai tempat (Puluhan sejajar Puluhan, Satuan sejajar Satuan).</p>
            <p>2. Jumlahkan kolom <strong>Satuan</strong> terlebih dahulu: {u1} + {u2} = {u1 + u2}.</p>
            {isCarry && (
              <p className="font-bold text-amber-700">
                Karena {u1 + u2} &ge; 10, tulis angka satuan ({ (u1 + u2) % 10 }) di bawah dan simpan 1 di atas kolom Puluhan!
              </p>
            )}
          </div>
        )}

        {activeLevel === 2 && (
          <div className="flex flex-col items-center gap-3 w-full bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <p className="text-xs sm:text-sm font-black text-blue-900">
              📦 Bantuan Level 2 – Representasi Visual Balok Simpan:
            </p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-blue-100">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400">Satuan ({u1}+{u2})</span>
                <span className="text-base font-black text-amber-600">{u1 + u2} kubus</span>
              </div>
              <span className="text-base font-black text-slate-400">➔</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-lg">
                  Simpan 1 Puluhan
                </span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-lg">
                  Tulis {(u1 + u2) % 10} Satuan
                </span>
              </div>
            </div>
          </div>
        )}

        {activeLevel === 3 && (
          <div className="flex flex-col gap-2 w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs sm:text-sm">
            <p className="font-black text-amber-900">📝 Bantuan Level 3 – Penjelasan Langkah Terurai:</p>
            <ol className="list-decimal pl-5 space-y-1 font-medium text-slate-700">
              <li>Hitung Satuan: {u1} + {u2} = {u1 + u2}. Tulis {(u1 + u2) % 10}, simpan {isCarry ? "1" : "0"}.</li>
              <li>Hitung Puluhan: {t1} + {t2} {isCarry ? "+ 1 (simpanan)" : ""} = {t1 + t2 + (isCarry ? 1 : 0)}.</li>
              <li className="font-bold text-amber-950">Hasil akhir: {num1 + num2}</li>
            </ol>
          </div>
        )}

        {activeLevel === 4 && (
          <div className="flex flex-col gap-2 w-full bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs sm:text-sm">
            <p className="font-black text-purple-900">🎯 Bantuan Level 4 – Contoh Lengkap & Pembuktian:</p>
            <div className="p-3 bg-white rounded-xl border border-purple-100 text-center font-mono font-black text-purple-800 text-sm">
              {num1} + {num2} = <span className="text-emerald-600">{num1 + num2}</span>
            </div>
            <p className="text-xs text-purple-900 font-semibold text-center">
              Cek Balik: {num1 + num2} − {num2} = {num1} (Terbukti Benar!)
            </p>
          </div>
        )}
      </div>
    );
  };

  const levelTabs = [
    { level: 1 as const, label: "Bantuan Level 1", sublabel: "(Petunjuk)", icon: HelpCircle },
    { level: 2 as const, label: "Bantuan Level 2", sublabel: "(Representasi)", icon: Eye },
    { level: 3 as const, label: "Bantuan Level 3", sublabel: "(Penjelasan Langkah)", icon: BookOpen },
    { level: 4 as const, label: "Bantuan Level 4", sublabel: "(Contoh Lengkap)", icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header Biru Khas Mockup */}
        <div className="bg-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
              6
            </span>
            <h3 className="text-sm sm:text-base font-black font-fredoka tracking-wide">
              Jika Salah – Bantuan Bertingkat (Level {activeLevel} dari 4)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
          >
            <X size={15} />
            <span>Tutup</span>
          </button>
        </div>

        {/* Modal Body: Sidebar Bantuan (Kiri) & Konten Visual (Kanan) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Kolom Kiri: Level Tabs */}
          <div className="md:col-span-5 bg-slate-50/80 p-3.5 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col gap-2">
            {levelTabs.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeLevel === item.level;
              return (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setActiveLevel(item.level)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left transition cursor-pointer border ${
                    isActive
                      ? "bg-blue-100/80 text-blue-950 border-blue-400 font-black shadow-xs ring-1 ring-blue-300"
                      : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 font-bold"
                  }`}
                >
                  <IconComponent size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <div className="leading-tight">
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{item.sublabel}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kolom Kanan: Visual & Penjelasan */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between gap-4">
            {renderVisualContent()}

            {/* Tombol Aksi: Naikkan Level & Coba Lagi */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
              {activeLevel < 4 ? (
                <button
                  type="button"
                  onClick={() => setActiveLevel((prev) => (Math.min(prev + 1, 4) as 1 | 2 | 3 | 4))}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                >
                  <span>Naik ke Level {activeLevel + 1}</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
                  Level Bantuan Tertinggi
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onTryAgain) onTryAgain();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-400/30 transition cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
