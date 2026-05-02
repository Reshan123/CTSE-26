const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

process.env.INTERNAL_SERVICE_KEY = "test-service-key";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  // Wait for any pending async operations (e.g., setTimeout callbacks) to complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {});

