import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import { env } from "~/env";


export function initBugsnag() {
  if (!env.BUGSNAG_API_KEY) {
    return;
  }
  Bugsnag.start({
    apiKey: env.BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
  });
}
