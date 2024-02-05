const express = require("express");
const app = express();
app.use(express.json()); // This line is crucial

const router = express.Router();
const { v4: uuid } = require("uuid");
const pool = require("../dbPool");

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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { artistname, image, campaigns } = req.body;
    const artistId = uuid();

    await connection.query(
      "INSERT INTO artists (id, artistname, image) VALUES (?, ?, ?)",
      [artistId, artistname, image]
    );

    // Check if campaigns is actually an array
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      for (const campaign of campaigns) {
        // Existing logic to process each campaign and its rewards...
      }
    } else {
      throw new TypeError("Expected 'campaigns' to be an array");
    }

    await connection.commit();
    res.status(201).send({
      message: "Artist, campaigns, and rewards created successfully",
      id: artistId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Transaction failed:", err);
    res.status(500).send("Failed to create artist, campaigns, and rewards");
  } finally {
    connection.release();
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
