const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuid } = require("uuid");

const artists = require("../data/artist-details.json");

function getArist() {
  const artistData = fs.readFileSync("./data/artist-details.json");
  return JSON.parse(artistData);
}

//Get all Artists
router.get("/", (req, res) => {
  const readArtists = fs.readFileSync("./data/artist-details.json");
  const artists = JSON.parse(readArtists);
  res.json(artists);
});

//Get individual Artist by id
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

//Setting form upload & JSON Parse

router.post("/", (req, res) => {
  const newCampaignRead = fs.readFileSync("./data/artist-details.json");
  const campaigns = JSON.parse(newCampaignRead);

  // Adding new working upload form code

  const {
    campaignName,
    artistname,
    goal,
    description,
    tourdates,
    firstReward,
    firstRewardValue,
    secondReward,
    secondRewardValue,
    thirdReward,
    thirdRewardValue,
    fourthReward,
    fourthRewardValue,
    fifthReward,
    fifthRewardValue,
  } = req.body;
  let image = req.files.image;

  image.mv("./public/images/" + image.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      const newCampaign = {
        id: uuid(),
        image: `http://localhost:8080/images/${image.name}`,
        artistname: artistname,
        campaigns: [
          {
            id: uuid(),
            campaignName: campaignName,
            image: `http://localhost:8080/${image.name}`,
            goal: goal,
            totalRaised: 0,
            description: description,
            tourdates: tourdates,
            rewards: [
              {
                firstReward: firstReward,
                firstRewardValue: firstRewardValue,
                secondReward: secondReward,
                secondRewardValue: secondRewardValue,
                thirdReward: thirdReward,
                thirdRewardValue: thirdRewardValue,
                fourthReward: fourthReward,
                fourthRewardValue: fourthRewardValue,
                fifthReward: fifthReward,
                fifthRewardValue: fifthRewardValue,
              },
            ],
          },
        ],
      };

      campaigns.push(newCampaign);

      fs.writeFileSync("./data/artist-details.json", JSON.stringify(campaigns));
      res.status(201).send("New campaign created");
    }
  });
});

router.put("/:id", (req, res) => {
  // Finding artists
  const findArtist = getArist();

  // Filtering by specific artist id
  const editArtist = findArtist.filter((artist) => artist.id !== req.params.id);
  console.log(editArtist);

  // Adding req body to update object
  const {
    campaignName,
    artistname,
    goal,
    description,
    tourdates,
    firstReward,
    firstRewardValue,
    secondReward,
    secondRewardValue,
    thirdReward,
    thirdRewardValue,
    fourthReward,
    fourthRewardValue,
    fifthReward,
    fifthRewardValue,
  } = req.body;

  console.log(req.body);

  const editedCampaign = {
    id: req.params.id,
    // image: `http://localhost:8080/images/${image.name}`,
    artistname: artistname,
    campaigns: [
      {
        id: req.params.id,
        campaignName: campaignName,
        // image: `http://localhost:8080/${image.name}`,
        goal: goal,
        totalRaised: 0,
        description: description,
        tourdates: tourdates,
        rewards: [
          {
            firstReward: firstReward,
            firstRewardValue: firstRewardValue,
            secondReward: secondReward,
            secondRewardValue: secondRewardValue,
            thirdReward: thirdReward,
            thirdRewardValue: thirdRewardValue,
            fourthReward: fourthReward,
            fourthRewardValue: fourthRewardValue,
            fifthReward: fifthReward,
            fifthRewardValue: fifthRewardValue,
          },
        ],
      },
    ],
  };

  editArtist.push(editedCampaign);

  fs.writeFileSync("./data/artist-details.json", JSON.stringify(editArtist));
  res.status(201).send("Campaign Succesfully edited");
});

module.exports = router;
