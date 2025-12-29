const fs = require('fs-extra');
const login = require('fca-priyansh');

// Load target UIDs
const targetUIDs = fs.existsSync("Target.txt")
  ? fs.readFileSync("Target.txt", "utf8").split("\n").map(x => x.trim()).filter(Boolean)
  : [];

const messageQueues = {};
const queueRunning = {};
let stopRequested = false;

// Login to Facebook
login({ appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, (err, api) => {
  if (err) return console.error("❌ Login failed:", err);

  api.setOptions({ listenEvents: true });
  console.log("✅ Target bot running...");

  api.listenMqtt(async (err, event) => {
    if (err || !event) return;
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    const args = body.trim().split(" ");
    const cmd = args[0].toLowerCase();
    const input = args.slice(1).join(" ");

    // Function to enqueue messages for a target UID
    const enqueueMessage = (uid, threadID, messageID) => {
      if (!messageQueues[uid]) messageQueues[uid] = [];
      messageQueues[uid].push({ threadID, messageID });

      if (queueRunning[uid]) return;
      queueRunning[uid] = true;

      if (!fs.existsSync("np.txt")) return;
      const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);
      let index = 0;

      const processQueue = async () => {
        if (!messageQueues[uid].length || stopRequested) {
          queueRunning[uid] = false;
          return;
        }

        const msg = messageQueues[uid].shift();
        const randomLine = lines[Math.floor(Math.random() * lines.length)];

        api.sendMessage(randomLine, msg.threadID, msg.messageID);
        setTimeout(processQueue, 60000); // 1 message per minute
      };

      processQueue();
    };

    // Auto spam to target UIDs
    if (targetUIDs.includes(senderID)) {
      enqueueMessage(senderID, threadID, messageID);
    }

    // Commands
    if (cmd === "/target") {
      if (!args[1]) return api.sendMessage("👤 UID de jisko target krna h", threadID);
      const uid = args[1];
      if (!targetUIDs.includes(uid)) {
        targetUIDs.push(uid);
        fs.writeFileSync("Target.txt", targetUIDs.join("\n"));
        api.sendMessage(`✅ Target add ho gaya: ${uid}`, threadID);
      } else {
        api.sendMessage(`⚠️ Ye UID already target list me hai: ${uid}`, threadID);
      }
    }

    else if (cmd === "/cleartarget") {
      targetUIDs.length = 0;
      fs.writeFileSync("Target.txt", "");
      stopRequested = true;
      api.sendMessage("🗑️ Saare targets clear ho gaye", threadID);
    }

    else if (cmd === "/stop") {
      stopRequested = true;
      api.sendMessage("🛑 Target spam stop kar diya", threadID);
    }

  });
});
