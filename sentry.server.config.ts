// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4eee13a429c3404b52252f5e666823cd@o4506485106016256.ingest.sentry.io/4506485107261440",
  tracesSampleRate: 1,
  debug: false,
});
