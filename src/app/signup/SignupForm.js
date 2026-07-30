"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, UserPlus, CircleAlert } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível criar a conta");
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-2xl shadow-black/30"
    >
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent">
          <UserPlus size={22} />
        </div>
        <h1 className="font-mono text-lg font-semibold text-text">Rotina &amp; Trading</h1>
        <p className="text-xs text-muted">Criar conta</p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Usuário
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
            <User size={15} className="text-muted shrink-0" />
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent outline-none text-sm text-text w-full"
              placeholder="usuário"
              autoComplete="username"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Senha
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
            <Lock size={15} className="text-muted shrink-0" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-sm text-text w-full"
              placeholder="senha (mín. 6 caracteres)"
              autoComplete="new-password"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Confirmar senha
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
            <Lock size={15} className="text-muted shrink-0" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent outline-none text-sm text-text w-full"
              placeholder="repita a senha"
              autoComplete="new-password"
            />
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-xs text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
            <CircleAlert size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 transition disabled:opacity-60"
        >
          <UserPlus size={16} />
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-center text-xs text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </form>
  );
}
