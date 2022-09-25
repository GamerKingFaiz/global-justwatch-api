const allLocalesAndProviders = require("../allLocalesAndProviders.json");

const cleanOffers = (offers, country) => {
  /**
   * Only keeping streaming only offers
   */
  const streamingOffers = offers.filter(
    (offer) =>
      offer.monetization_type === "flatrate" ||
      offer.monetization_type === "free" ||
      offer.monetization_type === "ads"
  );

  /**
   * Finds and removes offers with the same package_short_name
   * https://stackoverflow.com/a/36744732/14000052
   */
  let noDupes = streamingOffers.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.package_short_name === value.package_short_name)
  );
  // If it's a show return the offer with the highest season count
  if (offers[0].element_count) {
    noDupes = noDupes.map((element) => {
      const singleProviderMultipleQualities = streamingOffers.filter(
        (offer) => offer.package_short_name === element.package_short_name
      );
      // https://stackoverflow.com/a/34087850/14000052
      return singleProviderMultipleQualities.reduce((prev, current) =>
        prev.element_count > current.element_count ? prev : current
      );
    });
  }

  /**
   * Inputs service's friendly name and icon URL
   */
  noDupes.map((offer) => {
    const localeAndProvider = allLocalesAndProviders.find(
      (element) => element.country === country
    );
    const provider = localeAndProvider.providers.find(
      (element) => element.short_name === offer.package_short_name
    );
    offer.clearName = provider?.clear_name;
    offer.iconUrl = provider?.icon_url;
  });

  return noDupes;
};

module.exports = { cleanOffers };
