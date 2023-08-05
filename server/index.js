const path = require('path');
const express = require("express");
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();

let fs = require(`fs`);

const Discord = require("discord.js");

const discordToken = process.env.BOT_TOKEN;

const initialVideosJson = {
  videos: []
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
  if (!message.author.bot && message.channelId === "789223709483335710") {
    console.log(JSON.stringify(message))
    console.log(
      `Message reçu de ${message.author.username}: ${message.content}`
    );

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachmentURL = attachment.url;

      fs.readFile("./server/videos.json", (err, data) => {
        const videos = JSON.parse(data);
        videos.videos.push(attachmentURL);
        fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
      });
    } else if (message.embeds.length > 0) {
      fs.readFile("./server/videos.json", (err, data) => {
        const videos = JSON.parse(data);
        videos.videos.push(message.embeds[0].url);
        fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
      });
    }
  }
});

client.login(discordToken);

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
  const rawVideos = fs.readFileSync("./server/videos.json");
  const videos = JSON.parse(rawVideos);
  res.json(videos);
});

app.get("/delete-video", (req, res) => {
  fs.readFile("./server/videos.json", (err, data) => {
    const videos = JSON.parse(data);
    if (videos.videos.length) {
      const filename = videos.videos[0];
      videos.videos.shift();
      if (filename.startsWith("videos/")) {
        fs.unlink(`client/public/${filename}`, (err) => {
          if (err) {
            throw err;
          }
          console.log("Delete File successfully.");
        });
      }
      fs.writeFileSync("./server/videos.json", JSON.stringify(videos));
    }
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});