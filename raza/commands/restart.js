const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'restart',
    aliases: ['reboot'],
    description: 'Restart the bot',
    usage: 'restart',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, config }) {
    await send.reply(`🔄 ${config.BOTNAME} is restarting...`);
    
    setTimeout(() => {
      let entryFile = path.join(process.cwd(), 'raza.js');
      
      if (!fs.existsSync(entryFile)) {
        entryFile = path.join(process.cwd(), 'index.js');
      }
      
      const child = spawn('node', [entryFile], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
        env: process.env
      });
      
      child.unref();
      
      process.exit(0);
    }, 2000);
  }
};
