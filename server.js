const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

//HANDLING UNCOUGHT EXCEPTION(need to set it first)
process.on('uncaughtException', (err) => {
  console.log('UNCOUGHT EXCEPTION 😮 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// IMPORTING APP FROM APP.JS FILE
const app = require('./app');

mongoose.set('strictQuery', false);

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

// TO CONNECT THE DATABASE USING MONGOOSE V6
(async () => {
  await mongoose.connect(DB);
  console.log('DB connection successful✅');
})();

// START THE SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on PORT: ${port} ✅`);
});

// HANDLING UNHANDLED REJECTION
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 😮 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
