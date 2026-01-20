<<<<<<< HEAD
// backend/config/config.js

require("dotenv").config({ path: "../.env" });
=======
// backend/config/config.cjs

require('dotenv').config({ path: '../.env' });
>>>>>>> a809449 (Trying to update with messages)

const devUrl = process.env.DEVELOPMENT_CONNECTION_STRING;
const prodUrl = process.env.PRODUCTION_CONNECTION_STRING;

function urlRequestsSsl(url) {
  if (!url) return false;
  try {
<<<<<<< HEAD
    return (
      /sslmode=require/i.test(url) ||
      /ssl=true/i.test(url) ||
      /\?sslmode=/i.test(url)
    );
=======
    return /sslmode=require/i.test(url) ||
           /ssl=true/i.test(url) ||
           /\?sslmode=/i.test(url);
>>>>>>> a809449 (Trying to update with messages)
  } catch (e) {
    return false;
  }
}

const devNeedsSsl =
  urlRequestsSsl(devUrl) ||
<<<<<<< HEAD
  process.env.DEV_SSL === "true" ||
  process.env.DEVELOPMENT_SSL === "true";

const prodNeedsSsl =
  urlRequestsSsl(prodUrl) ||
  process.env.PROD_SSL === "true" ||
  process.env.PRODUCTION_SSL === "true";
=======
  process.env.DEV_SSL === 'true' ||
  process.env.DEVELOPMENT_SSL === 'true';
>>>>>>> a809449 (Trying to update with messages)

module.exports = {
  development: Object.assign(
    {
      url: devUrl || null,
<<<<<<< HEAD
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
=======
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

>>>>>>> a809449 (Trying to update with messages)
