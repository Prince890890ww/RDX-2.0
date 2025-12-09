const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const rankupGifs = [
  'https://i.imgur.com/o2CmSZc.gif',
  'https://i.imgur.com/Uppc0gg.gif',
  'https://i.imgur.com/YcpPIbV.gif'
];

function calculateLevel(exp) {
  return Math.floor((Math.sqrt(1 + (4 * exp / 3)) + 1) / 2);
}

module.exports = {
  config: {
    name: 'rankup',
    eventType: 'message',
    description: 'Announcement rankup with random gif for each group user'
  },
  
  async run({ api, event, Currencies, Users, Threads }) {
    const { threadID, senderID, body } = event;
    
    if (!body || !senderID || !threadID) return;
    
    const settings = Threads.getSettings(threadID);
    if (settings.rankup === false) return;
    
    try {
      let userData = Currencies.getData(senderID);
      let currentExp = userData.exp || 0;
      let currentLevel = calculateLevel(currentExp);
      
      let newExp = currentExp + 1;
      let newLevel = calculateLevel(newExp);
      
      Currencies.setData(senderID, { exp: newExp });
      
      if (newLevel > currentLevel && newLevel > 1) {
        let name = null;
        
        try {
          const info = await api.getUserInfo(senderID);
          if (info && info[senderID]) {
            const fullName = info[senderID].name;
            const firstName = info[senderID].firstName;
            const alternateName = info[senderID].alternateName;
            
            if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
              name = fullName;
            } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
              name = firstName;
            } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
              name = alternateName;
            }
          }
        } catch {}
        
        if (!name) {
          name = await Users.getNameUser(senderID);
        }
        
        if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
          name = 'Champion';
        }
        
        const message = `🎉 ${name}, (⓿_⓿)凸❯❯❯

𝐘𝐨𝐮𝐫 𝐊𝐞𝐲𝐛𝐨𝐚𝐫𝐝 𝐇𝐚𝐬 𝐑𝐞𝐚𝐜𝐡𝐞𝐝
𝐋𝐞𝐯𝐞𝐥 ${newLevel}

Keep chatting to level up!`;
        
        const cacheDir = path.join(__dirname, '../commands/cache/rankup');
        fs.ensureDirSync(cacheDir);
        
        const randomIndex = Math.floor(Math.random() * rankupGifs.length);
        const gifPath = path.join(cacheDir, `rankup${randomIndex + 1}.gif`);
        
        let attachment = null;
        
        try {
          if (!fs.existsSync(gifPath)) {
            const response = await axios.get(rankupGifs[randomIndex], { 
              responseType: 'arraybuffer',
              timeout: 10000 
            });
            fs.writeFileSync(gifPath, Buffer.from(response.data));
          }
          
          if (fs.existsSync(gifPath)) {
            attachment = fs.createReadStream(gifPath);
          }
        } catch (err) {
          console.error('Failed to load rankup gif:', err.message);
        }
        
        const msgContent = attachment 
          ? { body: message, attachment, mentions: [{ tag: name, id: senderID }] }
          : { body: message, mentions: [{ tag: name, id: senderID }] };
        
        api.sendMessage(msgContent, threadID);
      }
    } catch (error) {
      console.error('Rankup error:', error.message);
    }
  }
};
