const express = require("express");
const multer = require("multer");
const router = express.Router();
const { v4: uuid } = require("uuid");
const pool = require("../dbPool");

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({ storage: storage });

// Adjust your POST route to handle multipart/form-data
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { artistname } = req.body; // Other form fields are accessible as req.body
    const newId = uuid();
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Construct the path for the stored image

    await pool.query(
      "INSERT INTO artists (id, artistname, image) VALUES (?, ?, ?)",
      [newId, artistname, imagePath] // Use imagePath to store the image path in the database
    );

    res
      .status(201)
      .send({ message: "New artist created", id: newId, imagePath: imagePath });
  } catch (err) {
    console.error("Failed to create artist:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Enable CORS to allow requests from any origin
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Get all Artists with Campaigns - Publicly accessible
router.get("/", async (req, res) => {
  try {
    const [artistRows] = await pool.query("SELECT * FROM artists");
    const artistsWithCampaigns = await Promise.all(
      artistRows.map(async (artist) => {
        const [campaignRows] = await pool.query(
          "SELECT * FROM campaigns WHERE artist_id = ?",
          [artist.id]
        );
        return { ...artist, campaigns: campaignRows };
      })
    );
    res.json(artistsWithCampaigns);
  } catch (err) {
    console.error("Failed to fetch artists with campaigns:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get an artist by ID along with their campaigns
router.get("/:id", async (req, res) => {
  const artistId = req.params.id;
  try {
    // Fetch artist data
    const [artistDataRows] = await pool.query(
      "SELECT * FROM artists WHERE id = ?",
      [artistId]
    );

    if (artistDataRows.length === 0) {
      // If no artist data is found, send a 404 response or appropriate error message
      res.status(404).json({ error: "Artist not found" });
    } else {
      const artist = artistDataRows[0];

      // Fetch campaigns associated with the artist
      const [campaignRows] = await pool.query(
        "SELECT * FROM campaigns WHERE artist_id = ?",
        [artistId]
      );

      // Attach the campaigns to the artist data
      artist.campaigns = campaignRows;

      // Send the artist data with campaigns as a response
      res.json(artist);
    }
  } catch (error) {
    console.error("Error fetching artist:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add a new artist - No authentication required
router.post("/", async (req, res) => {
  try {
    const { artistname, image } = req.body;
    const newId = uuid();
    await pool.query(
      "INSERT INTO artists (id, artistname, image) VALUES (?, ?, ?)",
      [newId, artistname, image]
    );
    res.status(201).send({ message: "New artist created", id: newId });
  } catch (err) {
    console.error("Failed to create artist:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update an artist by id - No authentication required
router.put("/:id", async (req, res) => {
  try {
    const { artistname, image } = req.body;
    await pool.query(
      "UPDATE artists SET artistname = ?, image = ? WHERE id = ?",
      [artistname, image, req.params.id]
    );
    res.status(200).send("Artist updated successfully");
  } catch (err) {
    console.error("Failed to update artist:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
