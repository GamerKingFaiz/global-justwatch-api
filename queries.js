const JustWatch = require("justwatch-api");
const allLocalesAndProviders = require("./allLocalesAndProviders.json");
const { cleanOffers } = require("./utils/cleanOffers");
const { countriesSort } = require("./utils/countriesSort");

const jw = new JustWatch();

/**
 * /
 */
const root = (req, res) => {
  res.send("Personal Just Watch API");
};

/**
 * /search
 */
const getHomePageResults = (req, res) => {
  jw.search({ query: "" }).then((results) => res.send(results));
};

/**
 * /search/:query
 */
const search = async (req, res) => {
  const { query } = req.params;
  const results = await jw.request("post", "/titles/en_US/popular", {
    query: query,
    page_size: 4,
  });
  res.send(results);
};

/**
 * /title/:type/:titleId
 */
const getTitleStreamingServices = async (req, res) => {
  const { type, titleId } = req.params;
  let titleInfo = { metadata: {}, services: [] };
  const promises = allLocalesAndProviders.map(async (element, i) => {
    const localJw = new JustWatch({ locale: element.full_locale });
    const results = await localJw.getTitle(type, titleId);
    if (i === 0) titleInfo.metadata = results; // US is first index and metadata is set from its results
    if (results?.offers) {
      const cleanedOffers = cleanOffers(results.offers, element.country);
      if (cleanedOffers.length) {
        titleInfo.services.push({
          country: element.country,
          offers: cleanedOffers,
        });
      }
    }
  });
  try {
    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  }
  titleInfo.services.sort(countriesSort);
  res.send(titleInfo);
};

/**
 * /locales
 */
const getLocales = (req, res) => {
  jw.request("get", "/locales/state").then((results) =>
    res.send(
      results.map((result) => {
        return { country: result.country, full_locale: result.full_locale };
      })
    )
  );
};

/**
 * /providers
 */
const getAllProviders = async (req, res) => {
  let locales = await jw.request("get", "/locales/state");
  locales = locales.map((locale) => {
    return { country: locale.country, full_locale: locale.full_locale };
  });
  let allProviders = [];
  // Logic from https://github.com/Colaski/JustWatchAPITypeScript/blob/72911/justwatchapi.ts#L58-L71
  const promises = locales.map(async (locale) => {
    const localJw = new JustWatch({ locale: locale.full_locale });
    const localProviders = await localJw.getProviders();
    allProviders.push({
      country: locale.country,
      full_locale: locale.full_locale,
      providers: localProviders,
    });
  });
  await Promise.all(promises);
  allProviders.sort(countriesSort);
  res.send(allProviders);
};

module.exports = {
  root,
  getHomePageResults,
  search,
  getTitleStreamingServices,
  getLocales,
  getAllProviders,
};
