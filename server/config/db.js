const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.DATABASE) {
    throw new Error("DATABASE is missing");
  }

  if (!process.env.DATABASE_PASSWORD) {
    throw new Error("DATABASE_PASSWORD is missing");
  }

  const databaseUrl = process.env.DATABASE.replace(
    "<PASSWORD>",
    encodeURIComponent(process.env.DATABASE_PASSWORD)
  );

  await mongoose.connect(databaseUrl);

  console.log("✅ DB connection successful");
};

module.exports = connectDB;