import { useMemo, useState } from "react";
import { formatKm, formatLead, formatProbability, formatTimestamp } from "../lib/format";
import { usePortal } from "../state/PortalState";
import type { ConjunctionPlan } from "../types";

const PLANS: ConjunctionPlan[] = ["monitor", "maneuver", "cleared"];

export function ConjunctionsView() {
  const { conjunctions, selection, replaceSelection, setPlan, objectById } = usePortal();
  const [planFilter, setPlanFilter] = useState<ConjunctionPlan | "all">("all");

  const rows = useMemo(() => {
    return [...conjunctions]
      .filter((item) => planFilter === "all" || item.plan === planFilter)
      .sort((a, b) => new Date(a.tca).getTime() - new Date(b.tca).getTime());
  }, [conjunctions, planFilter]);

  const counts = useMemo(() => {
    return {
      monitor: conjunctions.filter((item) => item.plan === "monitor").length,
      maneuver: conjunctions.filter((item) => item.plan === "maneuver").length,
      cleared: conjunctions.filter((item) => item.plan === "cleared").length,
    };
  }, [conjunctions]);

  return (
    <section id="conjunctions-view" data-testid="conjunctions-view" className="view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Conjunction planning</h1>
          <p className="lede">
            Upcoming close approaches between catalog objects. Miss distance and time of closest approach come from the sample screening set. Choose a plan, or open a pair in the shared selection.
          </p>
        </div>
      </header>
      <div className="stat-row">
        <Stat label="Monitor" value={counts.monitor} tone="warning" />
        <Stat label="Maneuver" value={counts.maneuver} tone="serious" />
        <Stat label="Cleared" value={counts.cleared} tone="success" />
      </div>
      <div className="chip-row" role="group" aria-label="Filter by plan">
        {(["all", ...PLANS] as const).map((plan) => (
          <button
            key={plan}
            type="button"
            className="chip"
            aria-pressed={planFilter === plan}
            onClick={() => setPlanFilter(plan)}
          >
            {plan}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table className="object-table">
          <caption className="visually-hidden">Close approaches</caption>
          <thead>
            <tr>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Closest approach</th>
              <th>Miss distance</th>
              <th>Probability</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No conjunctions in this plan.
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const primary = objectById(item.primaryId);
                const secondary = objectById(item.secondaryId);
                const bothSelected =
                  selection.includes(item.primaryId) && selection.includes(item.secondaryId);
                return (
                  <tr
                    key={item.id}
                    data-testid={`conjunction-${item.id}`}
                    data-selected={bothSelected ? "true" : "false"}
                    onClick={() => replaceSelection([item.primaryId, item.secondaryId])}
                  >
                    <td>{primary?.name ?? item.primaryId}</td>
                    <td>{secondary?.name ?? item.secondaryId}</td>
                    <td>
                      <span className="stack">
                        <span>{formatTimestamp(item.tca)}</span>
                        <span className="muted">{formatLead(item.tca)}</span>
                      </span>
                    </td>
                    <td className="numeric">
                      <span className={item.missDistanceKm < 1 ? "miss miss--near" : "miss"}>
                        {formatKm(item.missDistanceKm, item.missDistanceKm < 10 ? 2 : 0)}
                      </span>
                    </td>
                    <td className="numeric">{formatProbability(item.probability)}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <div className="plan-group" role="group" aria-label={`Plan for ${primary?.name ?? "primary"} and ${secondary?.name ?? "secondary"}`}>
                        {PLANS.map((plan) => (
                          <button
                            key={plan}
                            type="button"
                            className={`plan plan--${plan}`}
                            aria-pressed={item.plan === plan}
                            onClick={() => setPlan(item.id, plan)}
                          >
                            {plan}
                          </button>
                        ))}
                      </div>
                      <p className="muted plan-note">{item.summary}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "warning" | "serious" | "success" }) {
  return (
    <div className={`stat stat--${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
