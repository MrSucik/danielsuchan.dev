import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://jarvischeck.com";
const STATUS_PAGE_SLUG =
  import.meta.env.VITE_STATUS_PAGE_SLUG ?? "personal";

export interface Service {
  name: string;
  url: string;
  status: "OK" | "ERROR" | "WARNING" | "UNKNOWN";
  uptime: number;
  incidentCount: number;
  avgResponseTime: number | null;
  lastChecked: string | null;
}

interface StatusPageData {
  page: { name: string; slug: string; description: string | null };
  services: Service[];
  allOperational: boolean;
  timeframeDays: number;
  lastRefreshed: string;
}

function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export function useServiceStatus() {
  const [services, setServices] = useState<Map<string, Service>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/public/status/${STATUS_PAGE_SLUG}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<StatusPageData>;
      })
      .then((data) => {
        const map = new Map<string, Service>();
        for (const service of data.services) {
          map.set(normalizeUrl(service.url), service);
        }
        setServices(map);
        setLoaded(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLoaded(true);
      });

    return () => controller.abort();
  }, []);

  const getServiceForUrl = (url: string): Service | undefined =>
    services.get(normalizeUrl(url));

  return { services, loaded, getServiceForUrl };
}
