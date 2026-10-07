"use client";

import React from "react";
import { Heart } from "lucide-react";

/**
 * Maskot Anak Laki-laki Ceria (Kartun Vektor SVG)
 */
export function BoyMascotVector({ size = 110 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className="inline-block drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bayangan halus */}
      <ellipse cx="80" cy="150" rx="45" ry="8" fill="#cbd5e1" opacity="0.6" />

      {/* Badan / Hoodie Biru */}
      <path
        d="M48 115 C40 125 35 145 35 155 L125 155 C125 145 120 125 112 115 Z"
        fill="#2563eb"
      />
      {/* Kerah Hoodie */}
      <path
        d="M60 115 Q80 132 100 115 Q90 140 70 140 Q60 128 60 115 Z"
        fill="#3b82f6"
      />
      {/* Tali Hoodie */}
      <line x1="72" y1="125" x2="70" y2="142" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="125" x2="90" y2="142" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

      {/* Leher */}
      <rect x="73" y="102" width="14" height="15" rx="4" fill="#fed7aa" />

      {/* Kepala & Wajah */}
      <ellipse cx="80" cy="74" rx="36" ry="34" fill="#fed7aa" />

      {/* Telinga */}
      <circle cx="44" cy="76" r="8" fill="#fed7aa" />
      <circle cx="44" cy="76" r="4" fill="#fbcfe8" opacity="0.6" />
      <circle cx="116" cy="76" r="8" fill="#fed7aa" />
      <circle cx="116" cy="76" r="4" fill="#fbcfe8" opacity="0.6" />

      {/* Rambut Cokelat Keren */}
      <path
        d="M44 68 C42 42 60 30 80 30 C102 30 118 42 116 68 C112 62 104 60 98 64 C90 55 75 56 68 64 C60 60 48 62 44 68 Z"
        fill="#78350f"
      />
      {/* Jambul depan */}
      <path d="M70 40 Q80 25 90 38 Q82 32 70 40 Z" fill="#92400e" />
      <path d="M56 48 Q64 36 74 46 Q64 42 56 48 Z" fill="#92400e" />

      {/* Alis Ceria */}
      <path d="M60 62 Q68 57 74 61" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M86 61 Q92 57 100 62" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" />

      {/* Mata Besar & Berbinar */}
      <ellipse cx="67" cy="72" rx="5.5" ry="6.5" fill="#1e293b" />
      <ellipse cx="93" cy="72" rx="5.5" ry="6.5" fill="#1e293b" />
      {/* Kilau Mata */}
      <circle cx="65" cy="70" r="2.2" fill="#ffffff" />
      <circle cx="68.5" cy="74" r="1.1" fill="#ffffff" />
      <circle cx="91" cy="70" r="2.2" fill="#ffffff" />
      <circle cx="94.5" cy="74" r="1.1" fill="#ffffff" />

      {/* Pipi Merona / Blush */}
      <ellipse cx="58" cy="80" rx="5.5" ry="3" fill="#f43f5e" opacity="0.4" />
      <ellipse cx="102" cy="80" rx="5.5" ry="3" fill="#f43f5e" opacity="0.4" />

      {/* Hidung Kecil Lucu */}
      <path d="M78 77 Q80 80 82 77" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />

      {/* Senyum Lebar Bahagia */}
      <path
        d="M70 85 Q80 97 90 85 Z"
        fill="#be123c"
      />
      {/* Gigi Putih */}
      <path
        d="M73 85 Q80 89 87 85 Z"
        fill="#ffffff"
      />

      {/* Tangan Kanan Memberi Jempol (Thumbs Up) */}
      <g transform="translate(112, 105)">
        <circle cx="16" cy="18" r="13" fill="#2563eb" />
        {/* Telapak Tangan */}
        <ellipse cx="18" cy="16" rx="9" ry="8" fill="#fed7aa" />
        {/* Jempol mengarah ke atas */}
        <path
          d="M19 12 C19 5 25 4 25 10 C25 14 22 17 19 17 Z"
          fill="#fed7aa"
          stroke="#ea580c"
          strokeWidth="1.2"
        />
        {/* Jari mengepal */}
        <path d="M12 14 Q16 14 18 16" stroke="#ea580c" strokeWidth="1.2" />
        <path d="M12 18 Q16 18 19 19" stroke="#ea580c" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/**
 * Maskot Anak Perempuan Ceria (Kartun Vektor SVG)
 */
export function GirlMascotVector({ size = 110 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className="inline-block drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bayangan halus */}
      <ellipse cx="80" cy="150" rx="42" ry="7" fill="#cbd5e1" opacity="0.6" />

      {/* Rambut Panjang di Belakang */}
      <path
        d="M40 70 C35 105 38 140 48 145 C55 148 58 125 58 110 Z"
        fill="#451a03"
      />
      <path
        d="M120 70 C125 105 122 140 112 145 C105 148 102 125 102 110 Z"
        fill="#451a03"
      />

      {/* Baju Merah Muda / Pink */}
      <path
        d="M52 118 C45 128 42 145 42 155 L118 155 C118 145 115 128 108 118 Z"
        fill="#ec4899"
      />
      {/* Kerah Baju */}
      <path
        d="M66 118 Q80 130 94 118 Q86 126 74 126 Z"
        fill="#fbcfe8"
      />

      {/* Leher */}
      <rect x="74" y="104" width="12" height="15" rx="4" fill="#fde68a" />

      {/* Kepala & Wajah */}
      <ellipse cx="80" cy="75" rx="34" ry="33" fill="#fde68a" />

      {/* Telinga dengan Anting Manis */}
      <circle cx="46" cy="77" r="7" fill="#fde68a" />
      <circle cx="46" cy="81" r="2.5" fill="#f43f5e" />
      <circle cx="114" cy="77" r="7" fill="#fde68a" />
      <circle cx="114" cy="81" r="2.5" fill="#f43f5e" />

      {/* Rambut Depan & Poni Cantik */}
      <path
        d="M46 68 C44 42 60 30 80 30 C100 30 116 42 114 68 C110 58 100 56 94 62 C86 52 74 52 66 62 C60 56 50 58 46 68 Z"
        fill="#78350f"
      />
      {/* Jepit Rambut Bunga Merah */}
      <circle cx="54" cy="46" r="4.5" fill="#ef4444" />
      <circle cx="54" cy="46" r="2" fill="#fef08a" />

      {/* Alis Cantik */}
      <path d="M62 64 Q68 59 74 63" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86 63 Q92 59 98 64" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mata Berbinar Ramah */}
      <ellipse cx="68" cy="73" rx="5" ry="6" fill="#1e293b" />
      <ellipse cx="92" cy="73" rx="5" ry="6" fill="#1e293b" />
      {/* Kilau Mata */}
      <circle cx="66" cy="71" r="2" fill="#ffffff" />
      <circle cx="69" cy="75" r="1" fill="#ffffff" />
      <circle cx="90" cy="71" r="2" fill="#ffffff" />
      <circle cx="93" cy="75" r="1" fill="#ffffff" />

      {/* Bulu Mata */}
      <path d="M63 68 L60 65" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M97 68 L100 65" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

      {/* Pipi Merona / Blush Merah Muda */}
      <ellipse cx="58" cy="81" rx="5" ry="2.8" fill="#f43f5e" opacity="0.45" />
      <ellipse cx="102" cy="81" rx="5" ry="2.8" fill="#f43f5e" opacity="0.45" />

      {/* Hidung Mungil */}
      <circle cx="80" cy="78" r="1.4" fill="#f59e0b" />

      {/* Senyum Manis Terbuka */}
      <path
        d="M72 86 Q80 97 88 86 Z"
        fill="#be123c"
      />
      <path
        d="M74 86 Q80 90 86 86 Z"
        fill="#ffffff"
      />

      {/* Tangan Kiri Melambai Bahagia */}
      <g transform="translate(24, 88)">
        <path
          d="M20 30 Q10 16 6 8 Q0 4 3 0 Q8 -2 15 8 Q24 22 25 32 Z"
          fill="#fde68a"
          stroke="#ea580c"
          strokeWidth="1.2"
        />
        {/* Jari melambai */}
        <circle cx="4" cy="5" r="3" fill="#fde68a" />
        <circle cx="7" cy="1" r="3" fill="#fde68a" />
        <circle cx="12" cy="0" r="3" fill="#fde68a" />
      </g>
    </svg>
  );
}

/**
 * Kartu Maskot Kiri: Anak Laki-laki + Balon Ucapan + Target Hari Ini
 */
export function BoySidebarCard({
  targetProgress = 3,
  targetTotal = 5,
}: {
  targetProgress?: number;
  targetTotal?: number;
}) {
  const pct = Math.min(100, Math.round((targetProgress / targetTotal) * 100));

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
      {/* Balon Ucapan Motivasi */}
      <div className="relative bg-amber-50/95 border border-amber-200/90 rounded-2xl p-3 shadow-xs speech-bubble-bottom">
        <p className="text-[11px] font-extrabold text-amber-950 leading-snug">
          Semua operasi bisa kamu kuasai! <br />
          <span className="text-amber-700 font-bold">Pelan-pelan, pasti bisa!</span>
        </p>
      </div>

      {/* Maskot Anak Laki-laki */}
      <div className="flex items-center gap-2 pl-2 -mt-1">
        <div className="animate-float-gentle">
          <BoyMascotVector size={85} />
        </div>
      </div>

      {/* Card: Target Hari Ini */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-700 font-fredoka flex items-center gap-1">
            🎯 Target Hari Ini
          </span>
          <span className="text-emerald-700 font-black text-[11px]">
            {targetProgress}/{targetTotal} soal
          </span>
        </div>

        {/* Progress Bar Hijau Cerah */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${pct}%` }}
          ></div>
        </div>

        {/* Kutipan Bijak */}
        <div className="mt-1 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-[10px] font-semibold italic text-slate-500 leading-tight">
            &ldquo;Kesalahan adalah langkah menuju keberhasilan.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Kartu Maskot Kanan: Maskot Anak Perempuan + Kartu "Ingat!"
 */
export function GirlEncouragementCard() {
  return (
    <div className="bg-rose-50/80 rounded-2xl p-3.5 border border-pink-200/80 shadow-xs flex items-center gap-3 animate-in fade-in duration-300">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 font-fredoka">
          <Heart size={14} className="fill-rose-500 text-rose-500" />
          <span>Ingat!</span>
        </div>
        <p className="text-[11px] font-bold text-slate-700 leading-snug">
          Tidak apa-apa jika masih salah. Yang penting kamu terus mencoba dan belajar dari kesalahan.
        </p>
      </div>

      <div className="shrink-0 animate-float-alt">
        <GirlMascotVector size={72} />
      </div>
    </div>
  );
}

/**
 * Angka Hiasan Melayang Ceria 1, 2, 3
 */
export function DecorativeFloatingNumbers() {
  return (
    <div className="flex flex-col items-center justify-center font-black select-none pointer-events-none pr-1">
      <span className="text-2xl text-blue-500 font-fredoka transform -rotate-12 translate-x-1 animate-float-gentle drop-shadow-xs">
        1
      </span>
      <span className="text-3xl text-amber-500 font-fredoka transform rotate-12 translate-x-3 -mt-1 animate-float-alt drop-shadow-xs">
        2
      </span>
      <span className="text-2xl text-emerald-500 font-fredoka transform -rotate-6 -translate-x-1 -mt-1 animate-float-gentle drop-shadow-xs">
        3
      </span>
    </div>
  );
}

/**
 * Sticky Note Motivasi "Kamu Bisa! 🎉"
 */
export function MotivationalStickyNote() {
  return (
    <div className="sticky-note-tilt bg-amber-100 text-amber-950 px-4 py-2.5 rounded-xl border border-amber-300/80 cursor-default select-none">
      <div className="flex items-center gap-1 text-xs font-black font-fredoka tracking-wide">
        <span>Kamu Bisa!</span>
        <span className="text-sm">🎉</span>
      </div>
      <div className="text-[9px] font-bold text-amber-800/80 mt-0.5">
        Pasti kamu juara!
      </div>
    </div>
  );
}
