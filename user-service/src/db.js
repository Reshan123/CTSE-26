const mongoose = require("mongoose");

async function connectDb(uri) {
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose;
}

module.exports = { connectDb };