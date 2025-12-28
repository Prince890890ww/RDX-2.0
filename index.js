const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const configPath = path.join(__dirname, 'Data/config/envconfig.json');
const appstatePath = path.join(__dirname, 'appstate.json');
const islamicPath = path.join(__dirname, 'Data/config/islamic_messages.json');

let botModule = null;
let botStarted = false;

const _0x7342=["\x52\x41\x5A\x41\x2D\x42\x6F\x54","\x2B\x39\x32\x33\x30\x30\x33\x33\x31\x30\x34\x37\x30","\x6B\x61\x73\x68\x69\x66\x72\x61\x7A\x61\x6D\x61\x6C\x6C\x61\x68\x32\x32\x40\x67\x6D\x61\x69\x6C\x2E\x63\x6F\x6D"];
const BRAND_NAME = _0x7342[0];
const BRAND_WHATSAPP = _0x7342[1];
const BRAND_EMAIL = _0x7342[2];

function getConfig() {
  try {
    return fs.readJsonSync(configPath);
  } catch {
    return {
      BOTNAME: 'Anika BOT',
      PREFIX: '-',
      ADMINBOT: ['100004301674794'],
      TIMEZONE: 'Asia/Dhaka',
      PREFIX_ENABLED: true,
      REACT_DELETE_EMOJI: '😡',
      ADMIN_ONLY_MODE: false,
      AUTO_ISLAMIC_POST: true,
      AUTO_GROUP_MESSAGE: true,
      APPROVE_ONLY: false
    };
  }
}

function saveConfig(config) {
  fs.writeJsonSync(configPath, config, { spaces: 2 });
}

function getAppstate() {
  try {
    return fs.readJsonSync(appstatePath);
  } catch {
    return null;
  }
}

function saveAppstate(appstate) {
  fs.writeJsonSync(appstatePath, appstate, { spaces: 2 });
}

app.get('/', (req, res) => {
  const config = getConfig();
  const hasAppstate = fs.existsSync(appstatePath);
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const time = moment().tz('Asia/Karachi').format('hh:mm:ss A');
  const date = moment().tz('Asia/Karachi').format('DD/MM/YYYY');
  
  let commandCount = 0;
  let eventCount = 0;
  try {
    const commandsPath = path.join(__dirname, 'raza/commands');
    const eventsPath = path.join(__dirname, 'raza/events');
    commandCount = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js')).length;
    eventCount = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js')).length;
  } catch {}
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME} - Control Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 2px solid #e94560;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5em;
      color: #e94560;
      text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
    }
    .header p {
      color: #aaa;
      margin-top: 10px;
    }
    .status-bar {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }
    .status-item {
      background: rgba(255,255,255,0.1);
      padding: 15px 25px;
      border-radius: 10px;
      text-align: center;
    }
    .status-item span {
      display: block;
      font-size: 0.9em;
      color: #aaa;
    }
    .status-item strong {
      font-size: 1.3em;
      color: #4ecca3;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border-radius: 15px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .card h2 {
      color: #e94560;
      margin-bottom: 20px;
      font-size: 1.3em;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 10px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #aaa;
      font-size: 0.9em;
    }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      color: #fff;
      font-size: 1em;
    }
    .form-group textarea {
      min-height: 150px;
      font-family: monospace;
    }
    .toggle {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toggle input[type="checkbox"] {
      width: 50px;
      height: 25px;
      appearance: none;
      background: #333;
      border-radius: 25px;
      position: relative;
      cursor: pointer;
    }
    .toggle input[type="checkbox"]:checked {
      background: #4ecca3;
    }
    .toggle input[type="checkbox"]::before {
      content: '';
      position: absolute;
      width: 21px;
      height: 21px;
      background: #fff;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: 0.3s;
    }
    .toggle input[type="checkbox"]:checked::before {
      left: 27px;
    }
    .btn {
      padding: 12px 25px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: 0.3s;
      margin: 5px;
    }
    .btn-primary {
      background: #e94560;
      color: #fff;
    }
    .btn-primary:hover {
      background: #d63050;
    }
    .btn-success {
      background: #4ecca3;
      color: #000;
    }
    .btn-success:hover {
      background: #3db890;
    }
    .alert {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      display: none;
    }
    .alert-success {
      background: rgba(78, 204, 163, 0.2);
      border: 1px solid #4ecca3;
      color: #4ecca3;
    }
    .alert-error {
      background: rgba(233, 69, 96, 0.2);
      border: 1px solid #e94560;
      color: #e94560;
    }
    .bot-status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
    }
    .bot-online {
      background: rgba(78, 204, 163, 0.2);
      color: #4ecca3;
    }
    .bot-offline {
      background: rgba(233, 69, 96, 0.2);
      color: #e94560;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p>Control Panel - Manage your Messenger Bot</p>
      <p style="margin-top: 10px;">
        <span class="bot-status ${botStarted ? 'bot-online' : 'bot-offline'}">
          ${botStarted ? 'BOT ONLINE' : 'BOT OFFLINE'}
        </span>
      </p>
      <div style="margin-top: 15px; color: #aaa; font-size: 0.9em;">
        <p>WhatsApp: <a href="https://wa.me/923003310470" style="color: #4ecca3;">${BRAND_WHATSAPP}</a></p>
        <p>Email: <a href="mailto:${BRAND_EMAIL}" style="color: #4ecca3;">${BRAND_EMAIL}</a></p>
      </div>
    </div>
    
    <div class="status-bar">
      <div class="status-item">
        <span>Time (PKT)</span>
        <strong>${time}</strong>
      </div>
      <div class="status-item">
        <span>Date</span>
        <strong>${date}</strong>
      </div>
      <div class="status-item">
        <span>Uptime</span>
        <strong>${hours}h ${minutes}m ${seconds}s</strong>
      </div>
      <div class="status-item">
        <span>Commands</span>
        <strong>${commandCount}</strong>
      </div>
      <div class="status-item">
        <span>Events</span>
        <strong>${eventCount}</strong>
      </div>
    </div>
    
    <div id="alert" class="alert"></div>
    
    <div class="grid">
      <div class="card">
        <h2>Bot Configuration</h2>
        <form id="configForm">
          <div class="form-group">
            <label>Bot Name</label>
            <input type="text" name="BOTNAME" value="${config.BOTNAME}" required>
          </div>
          <div class="form-group">
            <label>Prefix</label>
            <input type="text" name="PREFIX" value="${config.PREFIX}" required>
          </div>
          <div class="form-group">
            <label>Admin UIDs (comma separated)</label>
            <input type="text" name="ADMINBOT" value="${config.ADMINBOT.join(',')}" required>
          </div>
          <div class="form-group">
            <label>Delete Reaction Emoji</label>
            <input type="text" name="REACT_DELETE_EMOJI" value="${config.REACT_DELETE_EMOJI}">
          </div>
          <div class="form-group toggle">
            <input type="checkbox" name="PREFIX_ENABLED" ${config.PREFIX_ENABLED ? 'checked' : ''}>
            <label>Prefix Enabled</label>
          </div>
          <div class="form-group toggle">
            <input type="checkbox" name="ADMIN_ONLY_MODE" ${config.ADMIN_ONLY_MODE ? 'checked' : ''}>
            <label>Admin Only Mode</label>
          </div>
          <div class="form-group toggle">
            <input type="checkbox" name="AUTO_ISLAMIC_POST" ${config.AUTO_ISLAMIC_POST ? 'checked' : ''}>
            <label>Auto Islamic Posts (Hourly)</label>
          </div>
          <div class="form-group toggle">
            <input type="checkbox" name="AUTO_GROUP_MESSAGE" ${config.AUTO_GROUP_MESSAGE ? 'checked' : ''}>
            <label>Auto Group Messages (Hourly)</label>
          </div>
          <button type="submit" class="btn btn-primary">Save Configuration</button>
        </form>
      </div>
      
      <div class="card">
        <h2>AppState Management</h2>
        <p style="color: #aaa; margin-bottom: 15px; font-size: 0.9em;">
          Paste your Facebook cookies JSON below. AppState is required for bot login.
        </p>
        <form id="appstateForm">
          <div class="form-group">
            <label>AppState JSON</label>
            <textarea name="appstate" placeholder='[{"key": "c_user", "value": "...", ...}]'>${hasAppstate ? JSON.stringify(getAppstate(), null, 2) : ''}</textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save AppState</button>
        </form>
      </div>
      
      <div class="card">
        <h2>Bot Control</h2>
        <p style="color: #aaa; margin-bottom: 15px; font-size: 0.9em;">
          Start, restart, or reload the bot modules.
        </p>
        <button onclick="startBot()" class="btn btn-success">Start Bot</button>
        <button onclick="reloadCommands()" class="btn btn-primary">Reload Commands</button>
        <button onclick="reloadEvents()" class="btn btn-primary">Reload Events</button>
        <div style="margin-top: 20px;">
          <h3 style="color: #e94560; font-size: 1em; margin-bottom: 10px;">Quick Actions</h3>
          <button onclick="sendTestMessage()" class="btn btn-primary">Send Test Message</button>
        </div>
      </div>
      
      <div class="card">
        <h2>System Info</h2>
        <div style="line-height: 2;">
          <p><strong>Node Version:</strong> ${process.version}</p>
          <p><strong>Platform:</strong> ${process.platform}</p>
          <p><strong>Timezone:</strong> ${config.TIMEZONE}</p>
          <p><strong>Memory:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
          <p><strong>Appstate:</strong> ${hasAppstate ? 'Configured' : 'Not Set'}</p>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function showAlert(message, type) {
      const alert = document.getElementById('alert');
      alert.textContent = message;
      alert.className = 'alert alert-' + type;
      alert.style.display = 'block';
      setTimeout(() => alert.style.display = 'none', 5000);
    }
    
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const config = {
        BOTNAME: formData.get('BOTNAME'),
        PREFIX: formData.get('PREFIX'),
        ADMINBOT: formData.get('ADMINBOT').split(',').map(s => s.trim()),
        REACT_DELETE_EMOJI: formData.get('REACT_DELETE_EMOJI'),
        PREFIX_ENABLED: formData.get('PREFIX_ENABLED') === 'on',
        ADMIN_ONLY_MODE: formData.get('ADMIN_ONLY_MODE') === 'on',
        AUTO_ISLAMIC_POST: formData.get('AUTO_ISLAMIC_POST') === 'on',
        AUTO_GROUP_MESSAGE: formData.get('AUTO_GROUP_MESSAGE') === 'on',
        TIMEZONE: 'Asia/Karachi',
        APPROVE_ONLY: false
      };
      
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        const data = await res.json();
        if (data.success) {
          showAlert('Configuration saved!', 'success');
        } else {
          showAlert(data.error || 'Failed to save', 'error');
        }
      } catch (err) {
        showAlert('Error saving configuration', 'error');
      }
    });
    
    document.getElementById('appstateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const appstate = formData.get('appstate');
      
      try {
        JSON.parse(appstate);
      } catch {
        showAlert('Invalid JSON format', 'error');
        return;
      }
      
      try {
        const res = await fetch('/api/appstate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appstate: JSON.parse(appstate) })
        });
        const data = await res.json();
        if (data.success) {
          showAlert('AppState saved!', 'success');
        } else {
          showAlert(data.error || 'Failed to save', 'error');
        }
      } catch (err) {
        showAlert('Error saving appstate', 'error');
      }
    });
    
    async function startBot() {
      try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showAlert('Bot starting...', 'success');
          setTimeout(() => location.reload(), 2000);
        } else {
          showAlert(data.error || 'Failed to start', 'error');
        }
      } catch (err) {
        showAlert('Error starting bot', 'error');
      }
    }
    
    async function reloadCommands() {
      try {
        const res = await fetch('/api/reload/commands', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showAlert('Commands reloaded!', 'success');
        } else {
          showAlert(data.error || 'Failed to reload', 'error');
        }
      } catch (err) {
        showAlert('Error reloading commands', 'error');
      }
    }
    
    async function reloadEvents() {
      try {
        const res = await fetch('/api/reload/events', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showAlert('Events reloaded!', 'success');
        } else {
          showAlert(data.error || 'Failed to reload', 'error');
        }
      } catch (err) {
        showAlert('Error reloading events', 'error');
      }
    }
    
    async function sendTestMessage() {
      const uid = prompt('Enter UID to send test message:');
      if (!uid) return;
      
      try {
        const res = await fetch('/api/test-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        });
        const data = await res.json();
        if (data.success) {
          showAlert('Test message sent!', 'success');
        } else {
          showAlert(data.error || 'Failed to send', 'error');
        }
      } catch (err) {
        showAlert('Error sending test message', 'error');
      }
    }
    
    setInterval(() => location.reload(), 60000);
  </script>
</body>
</html>
  `);
});

app.post('/api/config', (req, res) => {
  try {
    const config = req.body;
    saveConfig(config);
    
    if (botModule) {
      botModule.loadConfig();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/appstate', (req, res) => {
  try {
    const { appstate } = req.body;
    saveAppstate(appstate);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/start', async (req, res) => {
  try {
    if (!fs.existsSync(appstatePath)) {
      return res.json({ success: false, error: 'AppState not configured' });
    }
    
    if (!botModule) {
      botModule = require('./raza');
    }
    
    botModule.startBot();
    botStarted = true;
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/reload/commands', async (req, res) => {
  try {
    if (!botModule) {
      return res.json({ success: false, error: 'Bot not started' });
    }
    
    await botModule.reloadCommands();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/reload/events', async (req, res) => {
  try {
    if (!botModule) {
      return res.json({ success: false, error: 'Bot not started' });
    }
    
    await botModule.reloadEvents();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/test-message', async (req, res) => {
  try {
    if (!botModule) {
      return res.json({ success: false, error: 'Bot not started' });
    }
    
    const api = botModule.getApi();
    if (!api) {
      return res.json({ success: false, error: 'Bot not logged in' });
    }
    
    const { uid } = req.body;
    const config = getConfig();
    
    api.sendMessage(`Test message from ${config.BOTNAME}!`, uid);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    botStarted,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    config: getConfig()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RAZA BOT Control Panel running on http://0.0.0.0:${PORT}`);
  
  if (fs.existsSync(appstatePath)) {
    console.log('AppState found, starting bot...');
    setTimeout(() => {
      botModule = require('./raza');
      botModule.startBot();
      botStarted = true;
    }, 2000);
  } else {
    console.log('No appstate found. Please configure through web panel.');
  }
});
