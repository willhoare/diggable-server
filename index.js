const express = require("express");
const cors = require("cors");
const { v4 } = require("uuid");
const fs = require("fs");
const app = express();
const allCampaigns = require("./routes/allcampaigns");
const individualCampaigns = require("./routes/campaign");

app.use(cors());
app.use(express.json());

app.listen(8080, () => {
  console.log("Server is running");
});

app.use(express.static("public"));

app.use("/allcampaigns", allCampaigns);
app.use("/campaign", individualCampaigns);
