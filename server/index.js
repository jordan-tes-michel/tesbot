const path = require('path');
const express = require("express");
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();

let fs = require(`fs`);

const Discord = require("discord.js");

const discordToken = process.env.BOT_TOKEN;
const users = process.env.USERS_NAME.split(",")
const discordChannelIds = process.env.USERS_CHANNEL_ID.split(",");

const initialVideosJson = {}

users.map((user, i) => {
  initialVideosJson[user] = {
    channelId: discordChannelIds[i],
    videos: [],
    text: [],
    skipped: false
  }
})

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

const addUrl = (message, url, text) => {
  fs.readFile("./server/videos.json", (err, data) => {
    const videos = JSON.parse(data);

    for (const user in videos) {
      if (videos[user].channelId === message.channelId) {
        videos[user].videos.push(url)
        videos[user].text.push(text);
      }
    }
    fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
  });
}

client.on("messageCreate", async (message) => {
  console.log("message received");
  // console.log(message);
  // Vérifiez si le message provient d'un utilisateur et n'est pas un message du bot lui-même
  if (!message.author.bot && discordChannelIds.includes(message.channelId)) {
    console.log(JSON.stringify(message))
    const imageUrlRegex = /\.(jpeg|jpg|gif|png)$/i;
    const imageTest = imageUrlRegex.test(message.content.split(" ")[0]);
    if (message.content.includes("youtube.com") || message.content.includes("youtu.be") ||imageTest) {
      const videoLink = message.content.split(" ")[0];
      const videoText = message.content.replace(videoLink, "").trim();
      addUrl(message, videoLink, videoText);
    } else if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachmentURL = attachment.url;
      const videoText = message.content;
      addUrl(message, attachmentURL, videoText);
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
    fs.readFile("./server/videos.json", (err, data) => {
      const videos = JSON.parse(data);
      if (videos[user] && videos[user].videos.length > 0) {
        videos[user].videos.shift();
        videos[user].text.shift();
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
            videos[user].text.shift();
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