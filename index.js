// const express = require("express");
// const cors = require("cors");
// const { v4 } = require("uuid");
// const fs = require("fs");
// const app = express();
// const allArtists = require("./routes/artists");
// const allCampaigns = require("./routes/allcampaigns");
// const jwt = require("jsonwebtoken");
// const fileupload = require("express-fileupload");
// const bodyParser = require("body-parser");
// const path = require("path");
// const e = require("express");
// require("dotenv").config();
// app.use(cors());
// app.use(express.json());
// app.use(fileupload());
// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

// app.listen(8080, () => {
//   console.log("Server is running");
// });

// app.use(express.static(path.join(__dirname, "public")));

// const rewards = new Map([
//   [1, { priceInCents: 5000, name: "First Reward" }],
//   [2, { priceInCents: 10000, name: "Second Reward" }],
// ]);

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: req.body.items.map((item) => {
//         const reward = rewards.get(item.id);
//         return {
//           price_data: {
//             currency: "cad",
//             product_data: {
//               name: reward.name,
//             },
//             unit_amount: reward.priceInCents,
//           },
//           quantity: item.quantity,
//         };
//       }),
//       success_url: `http://localhost:3000/successfulpayment`,
//       cancel_url: `${process.env.SERVER_URL}/cancel.html`,
//     });
//     res.json({ url: session.url });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// app.use("/artists", allArtists);
// app.use("/campaigns", allCampaigns);

// ////// Adding Sign up and login features //

// const jsonSecretKey = "f91e4494-04b3-4d49-8c27-57faed9e5785";

// app.use((req, res, next) => {
//   // Signup and login are public URLs that don't require a token
//   if (req.url === "/signup" || req.url === "/login") {
//     next();
//   } else {
//     const token = getToken(req);

//     if (token) {
//       console.log("Auth Token:", token);
//       if (jwt.verify(token, jsonSecretKey)) {
//         req.decode = jwt.decode(token);
//         next();
//       } else {
//         res.status(403).json({ error: "Not Authorized." });
//       }
//     } else {
//       res.status(403).json({ error: "No token. Unauthorized." });
//     }
//   }
// });

// function getToken(req) {
//   return req.headers.authorization.split(" ")[1];
// }

// const users = {};

// app.post("/signup", (req, res) => {
//   const { username, name, password } = req.body;
//   users[username] = {
//     name,
//     password, // NOTE: Passwords should NEVER be stored in the clear like this. Use a              // library like bcrypt to Hash the password. For demo purposes only.
//   };
//   console.log("Users Object:", users);
//   res.json({ success: "true" });
// });

// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const user = users[username];
//   if (user && user.password === password) {
//     console.log("Found user:", user);
//     res.json({ token: jwt.sign({ name: user.name }, jsonSecretKey) });
//   } else {
//     res.status(403).json({
//       token: "",
//       error: {
//         message: "Error logging in. Invalid username/password combination.",
//       },
//     });
//   }
// });

// app.get("/profile", (req, res) => {
//   res.json(req.decode);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fileupload = require("express-fileupload");
const path = require("path");
const mysql = require("mysql2/promise");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

// Route handlers
const allArtists = require("./routes/artists");
const allCampaigns = require("./routes/allcampaigns");

const app = express();
const saltRounds = 10;
const jsonSecretKey = process.env.JSON_SECRET_KEY;

// MySQL pool setup
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

// Rewards Map (Consider moving this to a database in the future)
const rewards = new Map([
  [1, { priceInCents: 5000, name: "First Reward" }],
  [2, { priceInCents: 10000, name: "Second Reward" }],
]);

// Stripe Checkout Session
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

// Bypass token verification for public routes
app.use("/artists", allArtists);
app.use("/campaigns", allCampaigns);

// Authentication middleware for protected routes
app.use((req, res, next) => {
  // Add '/rewards' to the list of paths that bypass token verification
  if (
    req.path === "/signup" ||
    req.path === "/login" ||
    req.path === "/rewards"
  ) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      jwt.verify(token, jsonSecretKey);
      next();
    } catch (error) {
      res.status(403).json({ error: "Not Authorized." });
    }
  } else {
    res.status(403).json({ error: "No token. Unauthorized." });
  }
});

// Signup
app.post("/signup", async (req, res) => {
  // Implementation for signup, including saving hashed passwords in the database
});

// Login
app.post("/login", async (req, res) => {
  // Implementation for login, including verifying hashed passwords
});

app.get("/rewards", async (req, res) => {
  const artistId = req.query.artistId;
  if (!artistId) {
    return res.status(400).json({ error: "Artist ID is required" });
  }

  try {
    // Use the adjusted JOIN query if rewards are related to artists through campaigns
    const [rewardsRows] = await pool.query(
      `
      SELECT rewards.* FROM rewards
      JOIN campaigns ON rewards.campaign_id = campaigns.id
      WHERE campaigns.artist_id = ?`,
      [artistId]
    );

    if (rewardsRows.length > 0) {
      res.json(rewardsRows);
    } else {
      res
        .status(404)
        .json({ error: "No rewards found for the specified artist" });
    }
  } catch (error) {
    console.error("Error retrieving rewards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
