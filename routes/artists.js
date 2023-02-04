const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuid } = require("uuid");

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

router.post("/", (req, res) => {
  const newVideoRead = fs.readFileSync("./data/artist-details.json");
  const allArtists = JSON.parse(newVideoRead);

  const { firstname, lastname, artistname, username, city, country } = req.body;
  const newArtist = {
    id: uuid(),
    firstname: firstname,
    lastname: lastname,
    artistname: artistname,
    image: "http://localhost:8080/images/happy-monday.jpeg",
    username: username,
    city: city,
    country: country,

    campaigns: [
      {
        id: "35bba08b-1b51-4153-ba7e-6da76b5ec1b9",
        title: "North American Tour 2023",
        description:
          "The Happy Mondays are looking to tour their new album across Narth America in 2023 and are seeking support to help achieve their goal.",
        goal: 0,
        tourdates: 1628522461000,
        rewards: [
          {
            1: "Personalised Video message",
            2: "Signed T-shirt",
            3: "Ticket for location of your choice",
          },
        ],
      },
    ],
  };

  allArtists.push(newArtist);
  fs.writeFileSync("./data/artist-details.json", JSON.stringify(allArtists));
  res.status(201).send("New artist profile created");
});

module.exports = router;
