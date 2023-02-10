const express = require("express");
const fs = require("fs");
const router = express.Router();

router.post("/", (req, res) => {
  const { campaignName } = req.body;
  let image = req.files.image;

  console.log(image);

  image.mv("./public/" + image.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      const newCampaign = {
        campaignName,
        path: `http://localhost:8080/${image.name}`,
      };

      fs.writeFileSync(
        "./data/campaign-details.json",
        JSON.stringify(newCampaign)
      );
      res.status(201).send("New campaign created");
    }
  });
});

module.exports = router;
