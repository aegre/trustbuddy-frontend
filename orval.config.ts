import { defineConfig } from "orval";

export default defineConfig({
  trustbuddy: {
    input: {
      target: "./openapi/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "src/api/generated/endpoints.ts",
      schemas: "src/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/mutator/custom-fetch.ts",
          name: "customFetch",
        },
      },
      mock: {
        generators: [
          {
            type: "msw",
            delay: 0,
          },
        ],
      },
    },
  },
});
