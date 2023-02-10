const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuid } = require("uuid");
// const upload = multer({ storage: storage });

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

  const {
    firstname,
    lastname,
    artistname,
    username,
    city,
    country,
    title,
    description,
    goal,
    tourdates,
    profileimage,
    first,
    firstvalue,
    second,
    secondvalue,
    third,
    thirdvalue,
    fourth,
    fourthtvalue,
    fifth,
    fifthvalue,
  } = req.body;
  const newArtist = {
    id: uuid(),
    firstname: firstname,
    lastname: lastname,
    artistname: artistname,
    profileimage: profileimage,
    username: username,
    city: city,
    country: country,

    campaigns: [
      {
        id: uuid(),
        title: title,
        description: description,
        goal: goal,
        totalRaised: 0,
        tourdates: tourdates,
        rewards: [
          {
            first: first,
            firstvalue: firstvalue,
            second: second,
            secondvalue: secondvalue,
            third: third,
            thirdvalue: thirdvalue,
            fourth: fourth,
            fourthvalue: fourthtvalue,
            fifth: fifth,
            fifthvalue: fifthvalue,
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
