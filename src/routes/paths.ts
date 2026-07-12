/** App path constants — routes and screens may import these. */
export const paths = {
  home: "/",
  login: "/login",
  wizardBase: "/wizard",
  wizardStep: "/wizard/:stepSlug",
  wizardPersonal: "/wizard/personal",
  success: "/success",
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

/** Confirmation screen after a successful quote submit. */
export function successHref(quoteId: string): string {
  const params = new URLSearchParams({ quoteId });
  return `${paths.success}?${params.toString()}`;
}
