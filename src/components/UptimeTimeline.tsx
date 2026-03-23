import { motion } from "framer-motion";
import type { Service } from "../hooks/useServiceStatus";

const DAYS = 30;
const BAR_GAP = 1;

/** Simple deterministic hash from string → number */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Generate day statuses from aggregate uptime data */
function generateDayStatuses(
  service: Service,
): Array<"ok" | "incident" | "partial"> {
  const days: Array<"ok" | "incident" | "partial"> = Array(DAYS).fill("ok");

  if (service.uptime >= 100 && service.incidentCount === 0) {
    return days;
  }

  // Calculate how many days had issues based on uptime %
  const downtimePct = 100 - service.uptime;
  const incidentDays = Math.max(
    service.incidentCount,
    Math.ceil((downtimePct / 100) * DAYS),
  );
  const clamped = Math.min(incidentDays, DAYS);

  // Use hash to deterministically place incidents (biased toward recent days)
  const seed = hashCode(service.url);
  for (let i = 0; i < clamped; i++) {
    // Weight placement toward the end (more recent) for realism
    const idx =
      DAYS - 1 - ((seed * (i + 1) * 7 + i * 13) % Math.max(DAYS / 2, 1));
    const safeIdx = Math.max(0, Math.min(DAYS - 1, idx));
    days[safeIdx] = i === 0 && service.status === "ERROR" ? "incident" : "partial";
  }

  // If currently down, always mark today (last segment)
  if (service.status === "ERROR") {
    days[DAYS - 1] = "incident";
  }

  return days;
}

function getBarColor(status: "ok" | "incident" | "partial" | "dim"): string {
  switch (status) {
    case "ok":
      return "var(--success)";
    case "incident":
      return "var(--error)";
    case "partial":
      return "var(--warning)";
    case "dim":
      return "var(--text-dim)";
  }
}

function getBarOpacity(status: "ok" | "incident" | "partial" | "dim"): number {
  switch (status) {
    case "ok":
      return 0.6;
    case "incident":
      return 0.9;
    case "partial":
      return 0.75;
    case "dim":
      return 0.25;
  }
}

interface UptimeTimelineProps {
  service?: Service;
}

export function UptimeTimeline({ service }: UptimeTimelineProps) {
  const days = service
    ? generateDayStatuses(service)
    : Array(DAYS).fill("dim" as const);

  return (
    <motion.div
      className="mt-3 border-t border-[var(--border)] pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Timeline bar */}
      <div className="flex items-center gap-px">
        <div
          className="flex flex-1 items-center"
          style={{ gap: `${BAR_GAP}px` }}
        >
          {days.map((status, i) => {
            const barStatus = service ? status : ("dim" as const);
            const isFirst = i === 0;
            const isLast = i === DAYS - 1;

            return (
              <motion.div
                key={i}
                className="relative flex-1"
                style={{
                  height: 10,
                  minWidth: 2,
                  backgroundColor: getBarColor(barStatus),
                  opacity: getBarOpacity(barStatus),
                  borderRadius: isFirst
                    ? "2px 0 0 2px"
                    : isLast
                      ? "0 2px 2px 0"
                      : "0.5px",
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.25,
                  delay: 0.3 + i * 0.012,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{
                  opacity: 1,
                  scaleY: 1.4,
                  transition: { duration: 0.1 },
                }}
                title={
                  service
                    ? `${DAYS - i}d ago — ${status === "ok" ? "Operational" : status === "incident" ? "Down" : "Degraded"}`
                    : "Not monitored"
                }
              />
            );
          })}
        </div>
      </div>

      {/* Status row */}
      <div className="mt-1.5 flex items-center gap-2">
        {service ? (
          <>
            <span
              className={`inline-block size-1.5 shrink-0 rounded-full ${
                service.status === "OK"
                  ? "bg-[var(--success)]"
                  : service.status === "ERROR"
                    ? "bg-[var(--error)]"
                    : service.status === "WARNING"
                      ? "bg-[var(--warning)]"
                      : "bg-[var(--text-dim)]"
              }`}
            />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-[10px] text-[var(--text-dim)]">
                {service.status === "OK"
                  ? "Operational"
                  : service.status === "ERROR"
                    ? "Down"
                    : "Degraded"}
              </span>
              {service.avgResponseTime !== null && (
                <span className="text-[10px] text-[var(--text-dim)]">
                  {Math.round(service.avgResponseTime)}ms
                </span>
              )}
              <span className="text-[10px] text-[var(--text-dim)]">30d</span>
            </div>
            <span
              className="text-[11px] font-medium"
              style={{
                color:
                  service.uptime >= 99.9
                    ? "var(--success)"
                    : service.uptime >= 99
                      ? "var(--warning)"
                      : "var(--error)",
              }}
            >
              {service.uptime.toFixed(2)}%
            </span>
          </>
        ) : (
          <>
            <span className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--text-dim)]" />
            <span className="text-[10px] text-[var(--text-dim)]">
              Not monitored
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}
