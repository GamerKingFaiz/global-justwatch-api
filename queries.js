const { default: fetch } = require("node-fetch");
const JustWatch = require("justwatch-api");
const locales = require("./locales.json");
const { cleanOffers } = require("./utils/cleanOffers");
const { countriesSort } = require("./utils/countriesSort");

const jw = new JustWatch();
const JW_API_URL = "https://apis.justwatch.com/graphql";

/**
 * /
 */
const root = (req, res) => {
  res.send("Personal Just Watch API");
};

/**
 * /search
 */
const getHomePageResults = async (req, res) => {
  const query = `
    query GetPopularTitles($country: Country!, $first: Int! = 70, $format: ImageFormat, $language: Language!, $after: String, $popularTitlesSortBy: PopularTitlesSorting! = POPULAR, $profile: PosterProfile, $sortRandomSeed: Int! = 0, $offset: Int = 0) {
      popularTitles(
        country: $country
        first: $first
        sortBy: $popularTitlesSortBy
        sortRandomSeed: $sortRandomSeed
        offset: $offset
        after: $after
      ) {
        edges {
          ...PopularTitleGraphql
          __typename
        }
        totalCount
        __typename
      }
    }
    
    fragment PopularTitleGraphql on PopularTitlesEdge {
      node {
        id
        objectId
        objectType
        content(country: $country, language: $language) {
          title
          fullPath
          posterUrl(profile: $profile, format: $format)
          __typename
        }
        __typename
      }
      __typename
    }
  `;

  const variables = {
    first: 40,
    popularTitlesSortBy: "POPULAR",
    sortRandomSeed: 0,
    offset: null,
    format: "WEBP",
    profile: "S166",
    after: "",
    language: "en",
    country: "US",
  };

  const results = await fetch(JW_API_URL, {
    method: "post",
    body: JSON.stringify({ query, variables }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await results.json();

  res.send(data);
};

/**
 * /search/:searchTerm
 */
const search = async (req, res) => {
  const { searchTerm } = req.params;

  const query = `
    query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter, $format: ImageFormat, $profile: PosterProfile) {
      popularTitles(country: $country, first: $first, filter: $filter) {
        edges {
          node {
            ...SuggestedTitle
            __typename
          }
          __typename
        }
        __typename
      }
    }
    
    fragment SuggestedTitle on MovieOrShow {
      id
      objectType
      objectId
      content(country: $country, language: $language) {
        fullPath
        title
        originalReleaseYear
        posterUrl(profile: $profile, format: $format)
        fullPath
        __typename
      }
      __typename
    }  
  `;

  const variables = {
    country: "US",
    language: "en",
    first: 4,
    profile: "S166",
    format: "WEBP",
    filter: {
      searchQuery: searchTerm,
    },
  };

  const results = await fetch(JW_API_URL, {
    method: "post",
    body: JSON.stringify({ query, variables }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await results.json();

  res.send(data);
};

/**
 * /title/:type/:titleId
 */
const getTitleStreamingServices = async (req, res) => {
  const { type, titleId } = req.params;
  let titleInfo = { metadata: {}, services: [] };
  const query = `
    query GetUrlTitleDetails($fullPath: String!, $country: Country!, $language: Language!, $platform: Platform! = WEB) {
      urlV2(fullPath: $fullPath) {
        id
        node {
          id
          __typename
          ... on MovieOrShowOrSeason {
            objectType
            objectId
            offerCount(country: $country, platform: $platform)
            offers(country: $country, platform: $platform, filter: {monetizationTypes: [FLATRATE, FREE, ADS]}) {
              monetizationType
              elementCount
              package {
                id
                packageId
                clearName
                icon(profile: S100, format: JPG)
                __typename
              }
              __typename
            }
            content(country: $country, language: $language) {
              externalIds {
                imdbId
                __typename
              }
              fullPath
              genres {
                shortName
                __typename
              }
              posterUrl
              fullPosterUrl: posterUrl(profile: S718, format: JPG)
              scoring {
                imdbScore
                imdbVotes
                tmdbPopularity
                tmdbScore
                __typename
              }
              shortDescription
              title
              originalReleaseYear
              originalReleaseDate
              ... on SeasonContent {
                seasonNumber
                __typename
              }
              __typename
            }
            __typename
          }
          ... on Show {
            totalSeasonCount
            __typename
          }
        }
        __typename
      }
    }
  `;
  const promises = locales.map(async (element, i) => {
    const variables = {
      platform: "WEB",
      fullPath: `/us/${type}/${titleId}`,
      language: element.full_locale.split("_")[0], // e.g. en
      country: element.full_locale.split("_")[1], // e.g. US
    };

    const results = await fetch(JW_API_URL, {
      method: "post",
      body: JSON.stringify({ query, variables }),
      headers: { "Content-Type": "application/json" },
    });
    const media = await results.json();

    const data = media.data.urlV2.node;
    if (i === 0)
      titleInfo.metadata = {
        ...data.content,
        totalSeasonCount: data.totalSeasonCount,
      }; // US is first index and metadata is set from its data
    if (data?.offers) {
      const cleanedOffers = cleanOffers(data.offers);
      if (cleanedOffers.length) {
        titleInfo.services.push({
          country: element.country,
          offers: cleanedOffers,
        });
      }
    }
  });
  await Promise.all(promises);
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
