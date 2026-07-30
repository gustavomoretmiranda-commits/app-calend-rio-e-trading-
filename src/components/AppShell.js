"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CalendarClock, LineChart, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import MainCalendarTab from "./calendar/MainCalendarTab";
import WeeklyTab from "./weekly/WeeklyTab";
import TradingTab from "./trading/TradingTab";

const TABS = [
  { key: "main", label: "Calendário principal", icon: CalendarDays },
  { key: "week", label: "Rotina semanal", icon: CalendarClock },
  { key: "trade", label: "Trading", icon: LineChart },
];

export default function AppShell() {
  const [tab, setTab] = useState("main");
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("carregando…");

  const reload = useCallback(async () => {
    const data = await apiRequest("/api/state");
    setState(data);
  }, []);

  useEffect(() => {
    reload()
      .then(() => setStatus("tudo salvo"))
      .catch(() => setStatus("erro ao carregar"));
  }, [reload]);

  const runMutation = useCallback(
    async (url, options) => {
      setStatus("salvando…");
      try {
        const result = await apiRequest(url, options);
        await reload();
        setStatus("tudo salvo");
        return result;
      } catch (err) {
        setStatus("erro ao salvar");
        throw err;
      }
    },
    [reload]
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <h1 className="font-mono text-lg font-semibold flex items-center gap-2">
          <LineChart className="text-accent" size={20} />
          Rotina &amp; Trading
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-muted">{status}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-loss transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-mono border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {!state ? (
        <div className="text-center text-muted text-sm py-20">Carregando…</div>
      ) : (
        <>
          <div className={tab === "main" ? "" : "hidden"}>
            <MainCalendarTab state={state} runMutation={runMutation} />
          </div>
          <div className={tab === "week" ? "" : "hidden"}>
            <WeeklyTab state={state} runMutation={runMutation} />
          </div>
          <div className={tab === "trade" ? "" : "hidden"}>
            <TradingTab state={state} runMutation={runMutation} />
          </div>
        </>
      )}
    </div>
  );
}
