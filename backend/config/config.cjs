// backend/config/config.js

require("dotenv").config({ path: "../.env" });

const devUrl = process.env.DEVELOPMENT_CONNECTION_STRING;
const prodUrl = process.env.PRODUCTION_CONNECTION_STRING;

function urlRequestsSsl(url) {
  if (!url) return false;
  try {
    return (
      /sslmode=require/i.test(url) ||
      /ssl=true/i.test(url) ||
      /\?sslmode=/i.test(url)
    );
  } catch (e) {
    return false;
  }
}

const devNeedsSsl =
  urlRequestsSsl(devUrl) ||
  process.env.DEV_SSL === "true" ||
  process.env.DEVELOPMENT_SSL === "true";

const prodNeedsSsl =
  urlRequestsSsl(prodUrl) ||
  process.env.PROD_SSL === "true" ||
  process.env.PRODUCTION_SSL === "true";

module.exports = {
  development: Object.assign(
    {
      url: devUrl || null,
      dialect: "postgres",
    },
    devNeedsSsl
      ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
      : {},
  ),
  test: {
    url: process.env.TEST_CONNECTION_STRING || null,
    dialect: "postgres",
  },
  production: Object.assign(
    {
      url: prodUrl || null,
      dialect: "postgres",
    },
    prodNeedsSsl
      ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
      : {},
  ),
};
