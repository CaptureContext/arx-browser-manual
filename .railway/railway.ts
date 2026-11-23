import { defineRailway, github, project, service } from "railway/iac";

// This repository manages only its own resources in the arx project: the
// manual. The website and the backend export their own partials from their
// repositories.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "arx-browser-manual";

export default defineRailway((ctx) => {
  if (!["production", "staging"].includes(ctx.environment)) {
    throw new Error(`The manual runs in production and staging, not ${ctx.environment}`);
  }
  const production = ctx.environment === "production";

  const manual = service("Manual", {
    // Production waits for GitHub checks before deploying; staging doesn't.
    source: github("CaptureContext/arx-browser-manual", { branch: "main", checkSuites: production }),
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
      // Only changes to the site rebuild it. .railway/ isn't read during deploys.
      watchPatterns: ["/apps/manual/**", "/packages/**", "/Dockerfile", "/nginx.conf", "/package.json", "/pnpm-lock.yaml", "/pnpm-workspace.yaml"],
    },
    start: "",
    healthcheck: "/",
    healthcheckTimeout: 100,
    replicas: { "ams": 1 },
    deploy: { restartPolicyMaxRetries: 3 },
    domains: production ? ["manual.arxbrowser.net", "manual.arx.capturecontext.dev"] : [],
    networking: { privateNetworkEndpoint: "manual-frontend" },
  });

  return project("arx", {
    // Variables are set in Railway, not here.
    variables: { managed: false },
    resources: [manual],
  });
});
