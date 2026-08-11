import React, { useState } from "react";
import { Lock, X, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function LoginForm({ onLoginSuccess, onCancel }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess();
      } else {
        setError(data.message || "Username atau password salah!");
      }
    } catch (err) {
      setError("Gagal terhubung ke server auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
        <button
          onClick={onCancel}
          type="button"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>
        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600">
          <Lock size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 font-fredoka">Dashboard Guru</h3>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Masuk dengan kredensial Admin Guru untuk mengelola rekapitulasi nilai kuis.
          </p>
        </div>
        
        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-200 flex items-center gap-2 justify-center">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-left space-y-3">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Username</label>
            <input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black py-2.5 rounded-xl transition duration-200"
          >
            {loading ? "Menghubungkan..." : "Masuk ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
