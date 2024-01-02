const express = require("express");
const cors = require("cors");
const { v4 } = require("uuid");
const fs = require("fs");
const app = express();
const allArtists = require("./routes/artists");
const allCampaigns = require("./routes/allcampaigns");
const jwt = require("jsonwebtoken");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const e = require("express");
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(fileupload());
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.listen(8080, () => {
  console.log("Server is running");
});

app.use(express.static(path.join(__dirname, "public")));

const rewards = new Map([
  [1, { priceInCents: 5000, name: "First Reward" }],
  [2, { priceInCents: 10000, name: "Second Reward" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const reward = rewards.get(item.id);
        return {
          price_data: {
            currency: "cad",
            product_data: {
              name: reward.name,
            },
            unit_amount: reward.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `http://localhost:3000/successfulpayment`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/artists", allArtists);
app.use("/campaigns", allCampaigns);

////// Adding Sign up and login features //

const jsonSecretKey = "f91e4494-04b3-4d49-8c27-57faed9e5785";

app.use((req, res, next) => {
  // Signup and login are public URLs that don't require a token
  if (req.url === "/signup" || req.url === "/login") {
    next();
  } else {
    const token = getToken(req);

    if (token) {
      console.log("Auth Token:", token);
      if (jwt.verify(token, jsonSecretKey)) {
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
