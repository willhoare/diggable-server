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

/// Setting up image upload
// const path = require("path");

// const multer = require("multer");
// const { timeStamp } = require("console");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public/images");
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// router.post("/", upload.single("testimage"), (req, res) => {
//   console.log(req.file);

//   res.send("image uploaded");
// });

//Setting form upload&json Parse

router.post("/", (req, res) => {
  const newCampaignRead = fs.readFileSync("./data/artist-details.json");
  const campaigns = JSON.parse(newCampaignRead);

  // adding new working upload form code

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

///// old req.body code
//   const {
//     firstname,
//     lastname,
//     artistname,
//     username,
//     city,
//     country,
//     title,
//     description,
//     goal,
//     tourdates,
//     profileimage,
//     first,
//     firstvalue,
//     second,
//     secondvalue,
//     third,
//     thirdvalue,
//     fourth,
//     fourthtvalue,
//     fifth,
//     fifthvalue,
//   } = req.body;
//   const newArtist = {
//     id: uuid(),
//     firstname: firstname,
//     lastname: lastname,
//     artistname: artistname,
//     profileimage: "http://localhost:8080/images/284152.jpeg",
//     username: username,
//     city: city,
//     country: country,

//     campaigns: [
//       {
//         id: uuid(),
//         title: title,
//         description: description,
//         goal: goal,
//         totalRaised: 0,
//         tourdates: tourdates,
//         rewards: [
//           {
//             first: first,
//             firstvalue: firstvalue,
//             second: second,
//             secondvalue: secondvalue,
//             third: third,
//             thirdvalue: thirdvalue,
//             fourth: fourth,
//             fourthvalue: fourthtvalue,
//             fifth: fifth,
//             fifthvalue: fifthvalue,
//           },
//         ],
//       },
//     ],
//   };

//   allArtists.push(newArtist);
//   fs.writeFileSync("./data/artist-details.json", JSON.stringify(allArtists));
//   res.status(201).send("New artist profile created");
// });

module.exports = router;
