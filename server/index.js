const path = require('path');
const express = require("express");
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();

let fs = require(`fs`);

const Discord = require("discord.js");

const discordToken = process.env.BOT_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

const initialVideosJson = {
  kurae: {
    videos: [],
    skipped: false
  }
};

fs.writeFileSync("./server/videos.json", JSON.stringify(initialVideosJson));

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  console.log("message received");
  // console.log(message);
  // Vérifiez si le message provient d'un utilisateur et n'est pas un message du bot lui-même
  if (!message.author.bot && message.channelId === discordChannelId) {
    console.log(JSON.stringify(message))
    console.log(
      `Message reçu de ${message.author.username}: ${message.content}`
    );

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachmentURL = attachment.url;

      fs.readFile("./server/videos.json", (err, data) => {
        const videos = JSON.parse(data);
        videos.kurae.videos.push(attachmentURL);
        fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
      });
    } else if (message.embeds.length > 0) {
      fs.readFile("./server/videos.json", (err, data) => {
        const videos = JSON.parse(data);
        videos.kurae.videos.push(message.embeds[0].url);
        fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
      });
    }
  }
});

client.login(discordToken);

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
  user = req.query.user;
  if (user) {
    const rawVideos = fs.readFileSync("./server/videos.json");
    const videos = JSON.parse(rawVideos);
    if (videos[user]) {
      res.json(videos[user]);
    }
  }
});

app.get("/delete-video", (req, res) => {
  user = req.query.user;
  if (user) {
    const videoUrl = req.query.title;
    fs.readFile("./server/videos.json", (err, data) => {
      const videos = JSON.parse(data);
      if (videos[user] && videos[user].videos.length > 0 && videos[user].videos[0] === videoUrl) {
        videos[user].videos.shift();
        fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
      }
    })
    res.json({ok: true});
  }
});

app.get("/skip-video", (req, res) => {
  const user = req.query.user;
  if (user) {
    fs.readFile("./server/videos.json", (err, data) => {
      const videos = JSON.parse(data);
      if (videos[user]) {
        if (!req.query.skipped) {
          if (videos[user].videos.length > 0) {
            videos[user].videos.shift();
            videos[user].skipped = true;
            console.log(videos);
            fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
          }
        } else if (req.query.skipped === "true") {
          videos[user].skipped = false;
          fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
          res.json({ok: true});
        }
      }
    })
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});