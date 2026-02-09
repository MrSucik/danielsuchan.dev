import { motion } from "framer-motion";
import { Activity, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://jarvischeck.com";

const STATUS_PAGE_SLUG = import.meta.env.VITE_STATUS_PAGE_SLUG ?? "personal";

interface Service {
  name: string;
  url: string;
  status: "OK" | "ERROR" | "WARNING" | "UNKNOWN";
  uptime: number;
  incidentCount: number;
  avgResponseTime: number | null;
  lastChecked: string | null;
}

interface StatusPageData {
  page: {
    name: string;
    slug: string;
    description: string | null;
  };
  services: Service[];
  allOperational: boolean;
  timeframeDays: number;
  lastRefreshed: string;
}

const statusColor: Record<string, string> = {
  OK: "bg-[var(--success)]",
  ERROR: "bg-[var(--error)]",
  WARNING: "bg-[var(--warning)]",
  UNKNOWN: "bg-[var(--text-dim)]",
};

const statusLabel: Record<string, string> = {
  OK: "Operational",
  ERROR: "Down",
  WARNING: "Degraded",
  UNKNOWN: "Unknown",
};

function UptimeBar({ uptime }: { uptime: number }) {
  const barColor =
    uptime >= 99.9
      ? "var(--success)"
      : uptime >= 99
        ? "var(--warning)"
        : "var(--error)";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: barColor }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(uptime, 100)}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
  );
}

export function ServiceUptime() {
  const [data, setData] = useState<StatusPageData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/public/status/${STATUS_PAGE_SLUG}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });

    return () => controller.abort();
  }, []);

  if (error || !data) return null;

  return (
    <motion.section
      className="mt-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 text-xs text-[var(--comment)]">
            {"// "}Uptime
          </p>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-bright)]">
            Service Status
          </h2>
        </div>
        <a
          href={`https://jarvischeck.com/status/${STATUS_PAGE_SLUG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--accent)]"
        >
          Status page <ExternalLink size={11} />
        </a>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`inline-block size-2 rounded-full ${data.allOperational ? "bg-[var(--success)]" : "bg-[var(--error)]"}`}
          />
          <span className="text-xs font-medium text-[var(--text-bright)]">
            {data.allOperational
              ? "All systems operational"
              : "Issues detected"}
          </span>
          <span className="ml-auto text-[10px] text-[var(--text-dim)]">
            {data.timeframeDays}d window
          </span>
        </div>

        <div className="space-y-3">
          {data.services.map((service, i) => (
            <motion.div
              key={service.name}
              className="group"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block size-1.5 rounded-full ${statusColor[service.status] ?? statusColor.UNKNOWN}`}
                  />
                  <span className="text-xs text-[var(--text)]">
                    {service.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-dim)]">
                    {statusLabel[service.status] ?? "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {service.avgResponseTime !== null && (
                    <span className="text-[10px] text-[var(--text-dim)]">
                      {Math.round(service.avgResponseTime)}ms
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      service.uptime >= 99.9
                        ? "text-[var(--success)]"
                        : service.uptime >= 99
                          ? "text-[var(--warning)]"
                          : "text-[var(--error)]"
                    }`}
                  >
                    {service.uptime.toFixed(2)}%
                  </span>
                </div>
              </div>
              <UptimeBar uptime={service.uptime} />
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1.5 border-t border-[var(--border)] pt-3">
          <Activity size={10} className="text-[var(--text-dim)]" />
          <span className="text-[10px] text-[var(--text-dim)]">
            Monitored by{" "}
            <a
              href="https://jarvischeck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              jarvischeck.com
            </a>
          </span>
        </div>
      </div>
    </motion.section>
  );
}
