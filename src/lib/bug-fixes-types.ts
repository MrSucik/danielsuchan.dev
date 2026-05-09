export interface BugFix {
  date: string;
  project: string;
  title: string;
  symptom: string;
  rootCause: string;
  fix: string;
  impact: string;
  commit?: string;
}

export interface BugFixesData {
  fixes: BugFix[];
}
