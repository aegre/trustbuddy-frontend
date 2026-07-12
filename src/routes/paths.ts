/** App path constants — routes and screens may import these. */
export const paths = {
  home: "/",
  login: "/login",
  wizardBase: "/wizard",
  wizardStep: "/wizard/:stepSlug",
  wizardPersonal: "/wizard/personal",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];

/** Convenience href for the personal step (quotes list CTAs). */
export function wizardPersonalHref(quoteId?: string): string {
  if (!quoteId) {
    return paths.wizardPersonal;
  }
  const params = new URLSearchParams({ quoteId });
  return `${paths.wizardPersonal}?${params.toString()}`;
}
