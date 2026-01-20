// backend/config/config.cjs

require('dotenv').config({ path: '../.env' });

const devUrl = process.env.DEVELOPMENT_CONNECTION_STRING;
const prodUrl = process.env.PRODUCTION_CONNECTION_STRING;

function urlRequestsSsl(url) {
  if (!url) return false;
  try {
    return /sslmode=require/i.test(url) ||
           /ssl=true/i.test(url) ||
           /\?sslmode=/i.test(url);
  } catch (e) {
    return false;
  }
}

const devNeedsSsl =
  urlRequestsSsl(devUrl) ||
  process.env.DEV_SSL === 'true' ||
  process.env.DEVELOPMENT_SSL === 'true';

module.exports = {
  development: Object.assign(
    {
      url: devUrl || null,
      dialect: 'postgres'
    },
    devNeedsSsl
      ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
      : {}
  ),

  test: {
    url:
      process.env.TEST_CONNECTION_STRING ||
      process.env.TEST_DATABASE_URL ||
      devUrl ||
      null,
    dialect: 'postgres'
  },

  production: Object.assign(
    {
      url: prodUrl || null,
      dialect: 'postgres'
    },
    prodUrl
      ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
      : {}
  )
};

