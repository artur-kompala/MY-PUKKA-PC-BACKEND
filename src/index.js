const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require("bcrypt");
const { log } = require("console");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// Register User
app.post("/signup", async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ email: data.email });

  if (existingUser) {
    res.send("User already exists.");
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.send("Sucess");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ email: req.body.email });
    if (!check) {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "User with provided email not found.",
        });
    } 
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Incorrect password." });
    } else {
      const token = jwt.sign({ userId: check._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      }); 
      return res
        .status(200)
        .json({
          session: { token },
          user: {
            role: "authenticated",
            user_metadata: {
                fullName: check.fullName,
                avatar: check.avatar,
            }
          },
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/verify-token", async (req, res) => {
    
  const token = req.body.token;
  
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Token not provided." });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid token." });
    }
    req.user = decoded;
  });
  res.status(200).json({ message: "Token is valid.", user: req.body.user });
});

// Define Port for Application
const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
