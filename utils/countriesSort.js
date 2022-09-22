// Sorts the array by country name, except United States is sent to the top
const countriesSort = (a, b) =>
  a.country === "United States"
    ? -1
    : b.country === "United States"
    ? 1
    : a.country.localeCompare(b.country);

module.exports = { countriesSort };
