/** App path constants — routes and screens may import these. */
export const paths = {
  home: "/",
  login: "/login",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
