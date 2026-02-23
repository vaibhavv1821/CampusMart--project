require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CampusMart server running on port ${PORT}`);
  });
});