"use client";

/* ------------------------------------------------------------------ */
/*  GarageStats — Mini-statistiques pour le dashboard garage          */
/*  3 KPIs : leads reçus, bids gagnés, revenus estimés                */
/* ------------------------------------------------------------------ */

interface StatsProps {
  leadsRecus: number;
  leadsAcceptes: number;
  bidsPlaces: number;
  bidsGagnes: number;
  revenusEstimes: number;
  tauxConversion: number;
  tempsReponseMoyen: string;
}

export default function GarageStats(props: StatsProps) {
  const stats = [
    {
      label: "Leads reçus",
      value: props.leadsRecus,
      sub: `${props.leadsAcceptes} acceptés`,
      color: "text-garaj-navy",
      bg: "bg-garaj-navy/5",
      icon: "📨",
    },
    {
      label: "Bids gagnés",
      value: props.bidsGagnes,
      sub: `${props.bidsPlaces} offres placées`,
      color: "text-garaj-orange",
      bg: "bg-garaj-orange/5",
      icon: "🏆",
    },
    {
      label: "Revenus",
      value: `${props.revenusEstimes}$`,
      sub: `${props.tauxConversion}% conversion`,
      color: "text-garaj-green",
      bg: "bg-garaj-green/5",
      icon: "💰",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-xl p-3 text-center flex flex-col items-center gap-1`}
        >
          <span className="text-lg">{s.icon}</span>
          <span className={`text-lg font-bold ${s.color} leading-tight`}>
            {s.value}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight">{s.label}</span>
          <span className="text-[10px] text-slate-400">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
