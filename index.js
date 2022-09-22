const express = require("express");
const queries = require("./queries");

const app = express();
const port = 3002;

app.get("/", queries.root);

/**
 * Returns search results based on query
 * https://apis.justwatch.com/content/titles/en_US/popular
 */
app.get("/search/:query", queries.search);

/**
 * Returns all streaming services for a title and the title's info
 * https://apis.justwatch.com/content/titles/${type}/${titleId}/locale/${full_locale}
 */
app.get("/title/:type/:titleId", queries.getTitleStreamingServices);

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
