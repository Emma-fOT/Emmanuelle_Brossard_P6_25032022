const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const User = require("../models/User");

const dotenv = require("dotenv");
dotenv.config();
const TOKEN_KEY = process.env.TOKEN_KEY;

const emailvalidator = require("email-validator");
const passwordValidator = require("password-validator");
let passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8) // Minimum length
  .is()
  .max(50) // Maximum length
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1) // Must have at least x digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .has()
  .symbols(1); // Must have at least x symbols

exports.signup = (req, res, next) => {
  if (!emailvalidator.validate(req.body.email)) {
    return res.status(401).json({ error: "Email non valide !" });
  } else {
    if (!passwordSchema.validate(req.body.password)) {
      return res.status(401).json({
        error:
          "Mot de passe trop faible : il doit contenir au moins 8 caractères (dont au moins un chiffre, une majuscules, une minuscules et un caractère spécial) !",
      });
    } else {
      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          const user = new User({
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    }
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, TOKEN_KEY, { expiresIn: "24h" }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
