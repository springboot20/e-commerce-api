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

module.exports = {
  getMognogoosePagination,
};
