const express = require("express");

const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_CLUSTER = process.env.DB_CLUSTER;
const DB_NAME = process.env.DB_NAME;
mongoose
  .connect(
    "mongodb+srv://" + DB_USERNAME + ":" + DB_PASSWORD + "@" + DB_CLUSTER + ".mongodb.net/" + DB_NAME + "?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

const rateLimit = require("express-rate-limit");
const attemptsLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// À partir de la version 4.16 d'Express, bodyparser est inclus et vous n'avez pas besoin de l'installer.
// Utilisez ( express.json() ) pour analyser le corps de la requête
app.use(express.json());
app.use(attemptsLimit);

// Pour éviter les erreurs de CORS (Cross-Origin Resource Sharing), car localhost:3000 et localhost:4200
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
