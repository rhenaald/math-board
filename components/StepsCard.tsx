import React from "react";
import { Sparkle } from "lucide-react";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface StepsCardProps {
  currentOp: SimpleOperation;
  num1: number;
  num2: number;
  correctAnswer: number;
}

export default function StepsCard({
  currentOp,
  num1,
  num2,
  correctAnswer,
}: StepsCardProps) {
  const renderMathStepsElements = () => {
    if (currentOp === "×" || currentOp === "÷") {
      const str1 = num1.toString();
      const len = str1.length;
      const subTotals: number[] = [];
      const stepsList = [];

      for (let i = 0; i < len; i++) {
        const digit = parseInt(str1[i], 10);
        const power = len - 1 - i;
        const val = digit * Math.pow(10, power);

        if (val > 0) {
          let label = "Satuan (S)";
          let colorClass = "bg-emerald-50/70 text-emerald-900 border-emerald-200";
          let dotColor = "text-emerald-500";

          if (power === 3) {
            label = "Ribuan (Rb)";
            colorClass = "bg-purple-50/70 text-purple-900 border-purple-200";
            dotColor = "text-purple-500";
          } else if (power === 2) {
            label = "Ratusan (R)";
            colorClass = "bg-indigo-50/70 text-indigo-900 border-indigo-200";
            dotColor = "text-indigo-500";
          } else if (power === 1) {
            label = "Puluhan (P)";
            colorClass = "bg-blue-50/70 text-blue-900 border-blue-200";
            dotColor = "text-blue-500";
          }

          const resPart = currentOp === "×" ? val * num2 : val / num2;
          subTotals.push(resPart);

          stepsList.push(
            <div
              key={`part-${i}`}
              className={`p-4 rounded-2xl border ${colorClass} flex items-center justify-between text-sm font-bold shadow-xs`}
            >
              <div className="flex items-center gap-2">
                <span className={`${dotColor} text-lg`}>●</span>
                <span>{label}</span>
              </div>
              <div className="font-black text-base">
                {val} {currentOp} {num2} = {resPart}
              </div>
            </div>
          );
        }
      }

      return (
        <div className="space-y-3">
          <div className="text-center mb-4">
            <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full uppercase tracking-wider mb-2">
              DEKOMPOSISI NILAI TEMPAT
            </span>
            <p className="font-extrabold text-slate-800 text-sm">
              Pecah {currentOp === "×" ? "Perkalian" : "Pembagian"} Parsial (Ratusan, Puluhan, Satuan)
            </p>
            <div className="mt-2 text-xl font-black text-slate-900 bg-slate-50 py-2.5 rounded-2xl border border-slate-200 inline-block px-8">
              {num1} {currentOp} {num2}
            </div>
          </div>
          {stepsList}
          <div className="mt-4 p-4 bg-emerald-100/80 border border-emerald-300 rounded-2xl text-center font-extrabold text-emerald-900 text-sm shadow-xs">
            Total Penjumlahan {subTotals.join(" + ")} ={" "}
            <span className="text-lg font-black text-emerald-900">{correctAnswer}</span>
          </div>
        </div>
      );
    } else if (currentOp === "+") {
      const u1 = num1 % 10;
      const u2 = num2 % 10;
      const sumU = u1 + u2;
      const carryT = Math.floor(sumU / 10);
      const ansU = sumU % 10;

      const t1 = Math.floor((num1 % 100) / 10);
      const t2 = Math.floor((num2 % 100) / 10);
      const sumT = t1 + t2 + carryT;
      const carryH = Math.floor(sumT / 10);
      const ansT = sumT % 10;

      const h1 = Math.floor((num1 % 1000) / 100);
      const h2 = Math.floor((num2 % 1000) / 100);
      const sumH = h1 + h2 + carryH;

      return (
        <div className="space-y-3">
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs font-bold text-rose-900 space-y-1">
            <div className="font-black text-sm flex items-center gap-2">
              <span>1.</span> Satuan (S)
            </div>
            <p>
              Hitung {u1} + {u2} = <b>{sumU}</b>.{" "}
              {carryT > 0 ? (
                <>
                  Tulis angka <b className="text-rose-700">{ansU}</b> di kolom Satuan, dan simpan{" "}
                  <b className="text-emerald-700">{carryT}</b> ke atas kolom Puluhan.
                </>
              ) : (
                <>
                  Tulis angka <b className="text-rose-700">{ansU}</b> di kolom Satuan.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 space-y-1">
            <div className="font-black text-sm flex items-center gap-2">
              <span>2.</span> Puluhan (P)
            </div>
            <p>
              Hitung {t1} + {t2} {carryT > 0 ? `+ ${carryT} (simpanan)` : ""} = <b>{sumT}</b>.{" "}
              {carryH > 0 ? (
                <>
                  Tulis <b className="text-emerald-700">{ansT}</b> di kolom Puluhan, dan simpan{" "}
                  <b className="text-indigo-700">{carryH}</b> ke kolom Ratusan.
                </>
              ) : (
                <>
                  Tulis <b className="text-emerald-700">{ansT}</b> di kolom Puluhan.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-900 space-y-1">
            <div className="font-black text-sm flex items-center gap-2">
              <span>3.</span> Ratusan (R) & Ribuan (Th)
            </div>
            <p>
              Hitung {h1} + {h2} {carryH > 0 ? `+ ${carryH} (simpanan)` : ""} = <b>{sumH}</b>. Tulis hasil di kolom Ratusan/Ribuan.
            </p>
          </div>
        </div>
      );
    } else {
      // Subtraction
      return (
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700">
            1. Hitung kolom <b className="text-rose-600 font-extrabold">Satuan (S)</b> terlebih dahulu. Jika angka atas lebih kecil, pinjam 1 puluhan (10) dari kolom Puluhan.
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700">
            2. Lanjutkan ke kolom <b className="text-emerald-600 font-extrabold">Puluhan (P)</b>. Kurangi angka atas (yang sudah berkurang 1 jika dipinjam) dengan angka bawah.
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700">
            3. Lanjutkan pengurangan hingga kolom <b className="text-indigo-600 font-extrabold">Ratusan (R)</b> atau <b className="text-amber-600 font-extrabold">Ribuan (Th)</b> untuk mendapat hasil akhir <b>{correctAnswer}</b>.
          </div>
        </div>
      );
    }
  };

  return (
    <div id="steps-card" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4 w-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-fredoka">
          <Sparkle size={18} className="text-purple-600" /> Langkah Penyelesaian Tersusun
        </h3>
        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg font-bold">
          Dekomposisi Nilai Tempat
        </span>
      </div>

      <div id="steps-container" className="space-y-3">
        {renderMathStepsElements()}
      </div>
    </div>
  );
}
