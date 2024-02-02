const mysql = require("mysql2/promise");
const fs = require("fs").promises;

const dbConfig = {
  host: "localhost",
  user: "root", // Use your MySQL username
  password: "rootroot", // Use your MySQL password
  database: "diggable",
};

const migrateData = async () => {
  const connection = await mysql.createConnection(dbConfig);
  const data = JSON.parse(
    await fs.readFile("./data/artist-details.json", "utf8")
  );

  for (const artist of data) {
    await connection.execute(
      "INSERT INTO artists (id, image, artistname) VALUES (?, ?, ?)",
      [artist.id, artist.image, artist.artistname]
    );

    for (const campaign of artist.campaigns) {
      await connection.execute(
        "INSERT INTO campaigns (id, artist_id, campaignName, image, goal, totalRaised, description, tourdates) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          campaign.id,
          artist.id,
          campaign.campaignName,
          campaign.image,
          campaign.goal,
          campaign.totalRaised,
          campaign.description,
          campaign.tourdates,
        ]
      );

      for (const reward of campaign.rewards) {
        await connection.execute(
          "INSERT INTO rewards (campaign_id, firstReward, firstRewardValue, secondReward, secondRewardValue, thirdReward, thirdRewardValue, fourthReward, fourthRewardValue, fifthReward, fifthRewardValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            campaign.id,
            reward.firstReward,
            reward.firstRewardValue,
            reward.secondReward,
            reward.secondRewardValue,
            reward.thirdReward,
            reward.thirdRewardValue,
            reward.fourthReward,
            reward.fourthRewardValue,
            reward.fifthReward,
            reward.fifthRewardValue,
          ]
        );
      }
    }
  }

  await connection.end();
  console.log("Data migration completed successfully.");
};

migrateData().catch((err) => console.error("Migration error:", err));
