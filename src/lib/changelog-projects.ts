export interface ChangelogProjectMeta {
  name: string;
  url?: string;
}

export const changelogProjects: Record<string, ChangelogProjectMeta> = {
  dzarvis: { name: "dzarvis.com", url: "https://dzarvis.com" },
  blaze: { name: "Blaze", url: "https://blaze.codes/" },
  jarvischeck: { name: "jarvischeck.com", url: "https://jarvischeck.com" },
  rozpocetpro: { name: "rozpocetpro.cz", url: "https://rozpocetpro.cz" },
  talentiqa: { name: "talentiqa.ai", url: "https://talentiqa.ai" },
  izzy: { name: "IZZY", url: "https://izzy.cz" },
  archipad: { name: "ArchiPad", url: "https://archipad.blaze.codes" },
  "motion-coach": { name: "Motion Coach", url: "https://motioncoach.app" },
  polygraf: { name: "MUNI Polygraf", url: "https://polygraf.muni.cz" },
  echo: { name: "ECHO", url: "https://aplikaceecho.cz" },
  nemoskop: { name: "nemoskop.cz", url: "https://nemoskop.cz" },
  "dotacni-sniper": {
    name: "dotacni-sniper.cz",
    url: "https://dotacni-sniper.cz",
  },
  morivo: { name: "morivo.cz", url: "https://morivo.cz" },
  suchanpro: { name: "suchanpro.cz", url: "https://suchanpro.cz" },
  pandidorty: { name: "pandidorty.cz", url: "https://pandidorty.cz" },
  "inside-blaze": {
    name: "inside.blaze.codes",
    url: "https://inside.blaze.codes",
  },
  uniklo: { name: "uniklo.cz", url: "https://uniklo.cz" },
  syncoli: { name: "syncoli.com", url: "https://www.syncoli.com/" },
  "suchan-capital": { name: "suchan.capital", url: "https://suchan.capital" },
  "danielsuchan-dev": {
    name: "danielsuchan.dev",
    url: "https://danielsuchan.dev",
  },
};

export function getProjectMeta(slug: string): ChangelogProjectMeta {
  return changelogProjects[slug] ?? { name: slug };
}
