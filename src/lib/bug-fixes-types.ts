export interface BugFix {
  date: string;
  project: string;
  title: string;
  /** Optional — only present on hand-curated war-story entries. */
  symptom?: string;
  /** Optional — only present on hand-curated war-story entries. */
  rootCause?: string;
  /** Optional — only present on hand-curated war-story entries. */
  fix?: string;
  /** Optional — only present on hand-curated war-story entries. */
  impact?: string;
  /** Git commit hash (from public repo). */
  commit?: string;
  /** GitHub repo for this entry (e.g. MrSucik/danielsuchan.dev). */
  repo?: string;
}

export interface BugFixesData {
  fixes: BugFix[];
}
