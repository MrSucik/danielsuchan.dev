export interface Project {
  name: string;
  url?: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Maintenance" | "Completed";
}

export interface ChangelogShipment {
  project: string;
  bullets: string[];
}

export interface ChangelogEntry {
  date: string;
  shipments: ChangelogShipment[];
}

export interface ChangelogData {
  entries: ChangelogEntry[];
}
