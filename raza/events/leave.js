module.exports = {
  config: {
    name: 'leave',
    eventType: 'log:unsubscribe',
    description: 'Goodbye messages and anti-out'
  },
  
  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const leftParticipantFbId = logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();
    
    if (leftParticipantFbId === botID) return;
    
    const settings = Threads.getSettings(threadID);
    
    let name = null;
    try {
      const info = await api.getUserInfo(leftParticipantFbId);
      if (info && info[leftParticipantFbId]) {
        const fullName = info[leftParticipantFbId].name;
        const firstName = info[leftParticipantFbId].firstName;
        const alternateName = info[leftParticipantFbId].alternateName;
        
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
      name = await Users.getNameUser(leftParticipantFbId);
    }
    
    if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
      name = 'Member';
    }
    
    if (settings.antiout) {
      try {
        await api.addUserToGroup(leftParticipantFbId, threadID);
        send.send(`🔒 ${name}, you can't leave! Anti-out is enabled.`, threadID);
        return;
      } catch {}
    }
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { participantIDs: [] };
    }
    
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    const goodbyeMsg = `👋 MEMBER LEFT
─────────────────
${name} has left the group
─────────────────
👥 Remaining: ${memberCount} members`;
    
    send.send(goodbyeMsg, threadID);
  }
};
