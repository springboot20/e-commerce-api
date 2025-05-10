const swaggerJsdoc = require("swagger-jsdoc");
const { join } = require("path");

/**
 * @type {swaggerJsdoc.Options} options
 */
const config = {
  definition: {
    openai: "3.1.0",
    info: {
      title: "Ecommerce Shopping RESTful Api",
      version: "0.1.0",
      description: "",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "CodeSuite",
        url: "https://github.com/springboot20",
        email: "opeyemiakanbi328@email.com",
      },
    },
    schemes: ["http", "https"],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:5050/api/v1",
      },
    ],
  },
  apis: [join(__dirname, "../routes/**/*.js"), join(__dirname, "../models/**/*.js")],
};

const specs = swaggerJsdoc(config);

module.exports = { specs };
