const express = require("express");
const fs = require("fs");
const router = express.Router();

router.post("/", (req, res) => {
  const newCampaignRead = fs.readFileSync("./data/campaign-details.json");
  const campaigns = JSON.parse(newCampaignRead);

  const { campaignName, firstName, goal, description } = req.body;
  let image = req.files.image;

  image.mv("./public/" + image.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      const newCampaign = {
        campaignName,
        path: `http://localhost:8080/${image.name}`,
        firstName,
        goal,
        description,
      };

      campaigns.push(newCampaign);

      fs.writeFileSync(
        "./data/campaign-details.json",
        JSON.stringify(campaigns)
      );
      res.status(201).send("New campaign created");
    }
  });
});

module.exports = router;
