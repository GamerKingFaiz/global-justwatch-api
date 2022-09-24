const allLocalesAndProviders = require("../allLocalesAndProviders.json");

const cleanOffers = (offers, country) => {
  /**
   * Only keeping streaming only offers
   */
  const flatrateOffers = offers.filter(
    (offer) =>
      offer.monetization_type === "flatrate" ||
      offer.monetization_type === "free" ||
      offer.monetization_type === "ads"
  );

  /**
   * Finds and removes offers with the same package_short_name
   * https://stackoverflow.com/a/36744732/14000052
   */
  const noDupes = flatrateOffers.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.package_short_name === value.package_short_name)
  );

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
