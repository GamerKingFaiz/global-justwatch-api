require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const queries = require("./queries");
const cache = require("./utils/cache");

const app = express();
app.use(morgan("short")); // Connection logging
app.set("trust proxy", 1);
const port = process.env.PORT || 3002;

// https://stackoverflow.com/questions/24897801/enable-access-control-allow-origin-for-multiple-domains-in-node-js
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  return next();
});

app.get("/", queries.root);

/**
 * Returns the top/popular search results
 * https://apis.justwatch.com/content/titles/en_US/popular
 */
app.get("/search/", cache(86400), queries.getHomePageResults);

/**
 * Returns search results based on query
 * https://apis.justwatch.com/content/titles/en_US/popular
 */
app.get("/search/:query", cache(86400), queries.search);

/**
 * Returns all streaming services for a title and the title's info
 * https://apis.justwatch.com/content/titles/${type}/${titleId}/locale/${full_locale}
 */
app.get("/title/:type/:titleId", cache(86400), queries.getTitleStreamingServices);

/**
 * Returns all locales and returns only country and full_locale
 * Likely not necessary as it's already called in /providers below
 * https://apis.justwatch.com/content/locales/state
 */
app.get("/locales", queries.getLocales);

/**
 * Returns all locales and their providers
 * Only run when allLocalesAndProviders.json needs to be updated
 * https://apis.justwatch.com/content/providers/locale/${full_locale}
 */
app.get("/providers", queries.getAllProviders);

app.listen(port, () => {
  console.log(`global-justwatch-api started on port ${port}`);
});
