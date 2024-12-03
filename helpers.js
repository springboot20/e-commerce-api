const { default: mongoose } = require("mongoose");

/**
 *
 * @param {number} limit
 * @returns {mongoose.PaginateOptions}
 */
const getMognogoosePagination = ({ limit = 10, page = 1, customLabels }) => {
  return {
    limit: Math.max(limit, 1),
    page: Math.max(page, 1),
    customLabels: {
      pagingCounter: "serial_counter",
      ...customLabels,
    },
  };
};

function removeCircularReferences(obj) {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    }),
  );
}

module.exports = {
  getMognogoosePagination,
  removeCircularReferences,
};
