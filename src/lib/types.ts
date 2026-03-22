export interface Project {
  name: string;
  url: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Maintenance" | "Completed";
}
