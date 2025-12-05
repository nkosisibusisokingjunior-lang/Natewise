import mongoose from "mongoose";

const MAX_RETRIES = Number(process.env.MONGO_MAX_RETRIES || 5);
const INITIAL_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 2000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectWithRetry() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  let attempt = 0;
  while (true) {
    try {
      await mongoose.connect(uri, {
        dbName,
      });
      console.log("MongoDB connected");
      return mongoose.connection;
    } catch (err) {
      attempt += 1;
      const shouldRetry = attempt <= MAX_RETRIES;
      console.warn(
        `Mongo connection failed (attempt ${attempt}/${MAX_RETRIES}).`,
        err.message
      );
      if (!shouldRetry) {
        throw err;
      }
      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}

export async function pingDb() {
  try {
    await mongoose.connection.db?.command({ ping: 1 });
    return true;
  } catch (err) {
    console.warn("Mongo ping failed:", err.message);
    return false;
  }
}
