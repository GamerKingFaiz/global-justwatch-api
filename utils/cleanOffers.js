const cleanOffers = (offers) => {
  /**
   * Finds and removes offers with the same clearName
   * https://stackoverflow.com/a/36744732/14000052
   */
  let noDupes = offers.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.package.clearName === value.package.clearName)
  );
  // If it's a show return the offer with the highest season count
  if (offers.length && offers[0]?.elementCount) {
    noDupes = noDupes.map((element) => {
      const singleProviderMultipleQualities = offers.filter(
        (offer) => offer.package.clearName === element.package.clearName
      );
      // https://stackoverflow.com/a/34087850/14000052
      return singleProviderMultipleQualities.reduce((prev, current) =>
        prev.elementCount > current.elementCount ? prev : current
      );
    });
  }

  return noDupes;
};

module.exports = { cleanOffers };
