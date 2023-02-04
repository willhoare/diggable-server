const express = require("express");
const router = express.Router();
const fs = require("fs");

const artists = require("../data/artist-details.json");

router.get("/", (req, res) => {
  const readArtists = fs.readFileSync("./data/artist-details.json");
  const artists = JSON.parse(readArtists);
  res.json(artists);
});

router.get("/:id", (req, res) => {
  getArists(req, res);
});

async function getArists(req, res) {
  const artistsDetails = getArist();
  const artistDetails = artistsDetails.find(
    (artistDetails) => artistDetails.id === req.params.id
  );
  if (artistDetails) {
    try {
      res.json(artistDetails);
    } catch {
      console.log("error");
    }
  }
}

function getArist() {
  const artistData = fs.readFileSync("./data/artist-details.json");
  return JSON.parse(artistData);
}

module.exports = router;
