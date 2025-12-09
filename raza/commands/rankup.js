module.exports = {
  config: {
    name: 'rankup',
    aliases: ['rank', 'levelup'],
    description: 'Toggle rankup notifications on/off for this group',
    usage: 'rankup [on/off]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, Threads }) {
    const { threadID, senderID } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = global.config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply('Only group admins can use this command.');
    }
    
    const settings = Threads.getSettings(threadID);
    const action = args[0]?.toLowerCase();
    
    if (!action) {
      const currentStatus = settings.rankup !== false ? 'ON' : 'OFF';
      return send.reply(`📊 Rankup Status: ${currentStatus}

Usage:
- rankup on - Enable rankup notifications
- rankup off - Disable rankup notifications`);
    }
    
    if (action === 'on' || action === 'enable') {
      Threads.setSetting(threadID, 'rankup', true);
      return send.reply('✅ Rankup notifications enabled!\n\nUsers will now receive level up announcements.');
    }
    
    if (action === 'off' || action === 'disable') {
      Threads.setSetting(threadID, 'rankup', false);
      return send.reply('❌ Rankup notifications disabled.');
    }
    
    return send.reply('Invalid option. Use: rankup on/off');
  }
};
