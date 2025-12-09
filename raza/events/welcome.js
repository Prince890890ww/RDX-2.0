module.exports = {
  config: {
    name: 'welcome',
    eventType: 'log:subscribe',
    description: 'Welcome new members'
  },
  
  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData.addedParticipants || [];
    const botID = api.getCurrentUserID();
    
    const settings = Threads.getSettings(threadID);
    
    if (settings.antijoin) {
      for (const participant of addedParticipants) {
        if (participant.userFbId === botID) continue;
        
        try {
          await api.removeUserFromGroup(participant.userFbId, threadID);
        } catch {}
      }
      return;
    }
    
    const newMembers = addedParticipants.filter(p => p.userFbId !== botID);
    
    if (newMembers.length === 0) return;
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { threadName: 'the group' };
    }
    
    const groupName = threadInfo.threadName || 'the group';
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    let welcomeMsg = `👋 WELCOME TO ${groupName.toUpperCase()}!
─────────────────\n`;
    
    for (const member of newMembers) {
      let name = member.fullName;
      
      if (!name || name.toLowerCase().includes('facebook') || name.toLowerCase() === 'user') {
        try {
          const info = await api.getUserInfo(member.userFbId);
          if (info && info[member.userFbId]) {
            const fullName = info[member.userFbId].name;
            const firstName = info[member.userFbId].firstName;
            const alternateName = info[member.userFbId].alternateName;
            
            if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
              name = fullName;
            } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
              name = firstName;
            } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
              name = alternateName;
            } else {
              name = await Users.getNameUser(member.userFbId);
            }
          }
        } catch {
          name = await Users.getNameUser(member.userFbId);
        }
      }
      
      if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
        name = 'New Member';
      }
      
      welcomeMsg += `🎉 ${name}\n`;
      Users.create(member.userFbId, name);
    }
    
    welcomeMsg += `─────────────────
👥 Total Members: ${memberCount}
─────────────────
Type ${config.PREFIX}help for commands`;
    
    send.send(welcomeMsg, threadID);
  }
};
