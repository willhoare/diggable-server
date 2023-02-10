const express = require("express");
const cors = require("cors");
const { v4 } = require("uuid");
const fs = require("fs");
const app = express();
const allCampaigns = require("./routes/allcampaigns");
const individualCampaigns = require("./routes/campaigns");
const allArtists = require("./routes/artists");
const jwt = require("jsonwebtoken");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());

app.listen(8080, () => {
  console.log("Server is running");
});

app.use(express.static("public"));

app.use("/allcampaigns", allCampaigns);
app.use("/campaignpage", individualCampaigns);
app.use("/artists", allArtists);

/// trying image upload approach 2

app.use(cors());
app.use(fileupload());
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", (req, res) => {
  const newpath = __dirname + "/files/";
  const file = req.files.file;
  const filename = file.name;

  file.mv(`${newpath}${filename}`, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed", code: 200 });
    }
    res.status(200).send({ message: "File Uploaded", code: 200 });
  });
});

////// Adding Sign up and login features //

const jsonSecretKey = "f91e4494-04b3-4d49-8c27-57faed9e5785";

app.use((req, res, next) => {
  // Signup and login are public URLs that don't require a token
  if (req.url === "/signup" || req.url === "/login") {
    next();
  } else {
    // Format of request is BEARER <token>. Splitting on ' ' will create an
    // array where the token is at index 1
    const token = getToken(req);

    if (token) {
      console.log("Auth Token:", token);
      if (jwt.verify(token, jsonSecretKey)) {
        // Decode the token to pass along to end-points that may need
        // access to data stored in the token.
        req.decode = jwt.decode(token);
        next();
      } else {
        res.status(403).json({ error: "Not Authorized." });
      }
    } else {
      res.status(403).json({ error: "No token. Unauthorized." });
    }
  }
});

function getToken(req) {
  return req.headers.authorization.split(" ")[1];
}

const users = {};

app.post("/signup", (req, res) => {
  const { username, name, password } = req.body;
  users[username] = {
    name,
    password, // NOTE: Passwords should NEVER be stored in the clear like this. Use a              // library like bcrypt to Hash the password. For demo purposes only.
  };
  console.log("Users Object:", users);
  res.json({ success: "true" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && user.password === password) {
    console.log("Found user:", user);
    res.json({ token: jwt.sign({ name: user.name }, jsonSecretKey) });
  } else {
    res.status(403).json({
      token: "",
      error: {
        message: "Error logging in. Invalid username/password combination.",
      },
    });
  }
});

app.get("/profile", (req, res) => {
  res.json(req.decode);
});
