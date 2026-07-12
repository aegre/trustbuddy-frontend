/** App path constants — routes and screens may import these. */
export const paths = {
  home: "/",
  login: "/login",
  wizardPersonal: "/wizard/personal",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];

export function wizardPersonalHref(quoteId?: string): string {
  if (!quoteId) {
    return paths.wizardPersonal;
  }
  const params = new URLSearchParams({ quoteId });
  return `${paths.wizardPersonal}?${params.toString()}`;
}
