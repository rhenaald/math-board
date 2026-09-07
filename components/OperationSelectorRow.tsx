"use client";

import React from "react";
import { Plus, Minus, X, Divide, Shuffle } from "lucide-react";
import { OperationType } from "./SetupWizard";

interface OperationSelectorRowProps {
  selectedOp: OperationType;
  onSelectOp: (op: OperationType) => void;
}

export default function OperationSelectorRow({
  selectedOp,
  onSelectOp,
}: OperationSelectorRowProps) {
  const operations = [
    {
      id: "+" as OperationType,
      title: "Penjumlahan",
      desc: "Gabungkan bilangan",
      icon: Plus,
      bgActive: "bg-emerald-100 border-emerald-400 ring-4 ring-emerald-300/60 shadow-md",
      bgDefault: "bg-emerald-50/70 border-emerald-200/90 hover:bg-emerald-100/70",
      badgeColor: "bg-emerald-600 text-white",
      textColor: "text-emerald-950",
      descColor: "text-emerald-700",
    },
    {
      id: "-" as OperationType,
      title: "Pengurangan",
      desc: "Kurangkan bilangan",
      icon: Minus,
      bgActive: "bg-amber-100 border-amber-400 ring-4 ring-amber-300/60 shadow-md",
      bgDefault: "bg-orange-50/70 border-orange-200/90 hover:bg-orange-100/70",
      badgeColor: "bg-orange-500 text-white",
      textColor: "text-orange-950",
      descColor: "text-orange-700",
    },
    {
      id: "×" as OperationType,
      title: "Perkalian",
      desc: "Kalikan bilangan",
      icon: X,
      bgActive: "bg-rose-100 border-rose-400 ring-4 ring-rose-300/60 shadow-md",
      bgDefault: "bg-rose-50/70 border-rose-200/90 hover:bg-rose-100/70",
      badgeColor: "bg-rose-500 text-white",
      textColor: "text-rose-950",
      descColor: "text-rose-700",
    },
    {
      id: "÷" as OperationType,
      title: "Pembagian",
      desc: "Bagi bilangan",
      icon: Divide,
      bgActive: "bg-purple-100 border-purple-400 ring-4 ring-purple-300/60 shadow-md",
      bgDefault: "bg-purple-50/70 border-purple-200/90 hover:bg-purple-100/70",
      badgeColor: "bg-purple-600 text-white",
      textColor: "text-purple-950",
      descColor: "text-purple-700",
    },
    {
      id: "mix" as OperationType,
      title: "Mode Campuran",
      desc: "Latihan semua operasi",
      icon: Shuffle,
      bgActive: "bg-cyan-100 border-cyan-400 ring-4 ring-cyan-300/60 shadow-md",
      bgDefault: "bg-cyan-50/70 border-cyan-200/90 hover:bg-cyan-100/70",
      badgeColor: "bg-cyan-600 text-white",
      textColor: "text-cyan-950",
      descColor: "text-cyan-700",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      <h3 className="text-xs md:text-sm font-black text-slate-800 tracking-tight font-fredoka flex items-center gap-1.5 pl-1">
        Pilih Operasi yang Ingin Dilatih
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3">
        {operations.map((op) => {
          const Icon = op.icon;
          const isSelected = selectedOp === op.id;

          return (
            <button
              key={op.id}
              type="button"
              onClick={() => onSelectOp(op.id)}
              className={`p-3 md:p-3.5 rounded-2xl md:rounded-3xl border transition-all duration-200 text-center flex flex-col items-center gap-2 cursor-pointer transform active:scale-95 ${
                isSelected ? `${op.bgActive} scale-102` : `${op.bgDefault} hover:scale-101`
              }`}
            >
              {/* Badge Ikon Operasi */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs font-black transition ${op.badgeColor}`}
              >
                <Icon size={18} className="stroke-[3]" />
              </div>

              {/* Judul & Deskripsi Operasi */}
              <div className="leading-tight">
                <div className={`text-xs md:text-sm font-black font-fredoka ${op.textColor}`}>
                  {op.title}
                </div>
                <div className={`text-[10px] md:text-[11px] font-bold ${op.descColor} mt-0.5`}>
                  {op.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
