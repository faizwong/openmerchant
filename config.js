const dotenv = require('dotenv');

dotenv.config();

const config = {
  production: {
    db: {
      url: process.env.DATABASE_URL,
      options: {
        logging: false,
        ssl: true,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            required: true,
            rejectUnauthorized: false
          }
        }
      }
    }
  },
  development: {
    db: {
      url: 'sqlite:./db/dev1.sqlite3',
      options: {
        logging: false
      }
    }
  },
  development2: {
    db: {
      url: process.env.DATABASE_URL,
      options: {
        logging: false
      }
    }
  },
  test: {
    db: {
      url: 'sqlite::memory:',
      options: {
        logging: false
      }
    }
  }
};

module.exports = config;
