const express = require('express');
const http = require('http');
const net = require('net');
const path = require('path');
const aedes = require('aedes')();

const WEB_PORT = 3000;
const MQTT_PORT = 1883;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const web = http.createServer(app);
const broker = net.createServer(aedes.handle);

let clients = [];
let nodes = {};
let log = [];
let mqttClients = 0;

function send(res, type, data) {
  res.write(`event: ${type}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(type, data) {
  clients.forEach(res => send(res, type, data));
}

function status() {
  return { mqttClients, nodes: Object.keys(nodes).length, messages: log.length };
}

function topicNode(topic) {
  const m = topic.match(/^streetlight\/([^/]+)\/state$/);
  return m ? m[1] : null;
}

function saveMessage(packet) {
  const topic = packet.topic || '';
  const node = topicNode(topic);
  if (!node) return;

  const text = packet.payload.toString();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  const item = { id: log.length + 1, time: new Date().toLocaleTimeString(), topic, node, data };
  nodes[node] = item;
  log.unshift(item);
  log = log.slice(0, 80);

  console.log(`[web-log] ${node} ${data.stateCode || '?'} ${data.state || ''} mode=${data.mode || '-'}`);
  broadcast('message', { item, nodes, log, status: status() });
}

function brokerPublish(topic, payload, res) {
  const text = JSON.stringify(payload);
  aedes.publish({ topic, payload: Buffer.from(text), qos: 1, retain: false }, err => {
    if (err) return res.status(500).json({ error: err.message });
    console.log(`[cmd] ${topic} ${text}`);
    res.json({ ok: true, topic, payload });
  });
}

aedes.on('client', c => {
  mqttClients++;
  console.log(`[mqtt] CONNECT ${c.id}`);
  broadcast('status', status());
});

aedes.on('clientDisconnect', c => {
  mqttClients = Math.max(0, mqttClients - 1);
  console.log(`[mqtt] DISCONNECT ${c.id}`);
  broadcast('status', status());
});

aedes.on('publish', (packet, client) => {
  if (!client) return;
  console.log(`[mqtt] ${client.id} -> ${packet.topic}`);
  saveMessage(packet);
});

app.get('/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  clients.push(res);
  send(res, 'message', { nodes, log, status: status() });
  req.on('close', () => { clients = clients.filter(x => x !== res); });
});

app.post('/api/cmd', (req, res) => {
  const { node, color, mode } = req.body || {};
  if (!node) return res.status(400).json({ error: 'node is required' });

  if (mode === 'auto') return brokerPublish(`streetlight/${node}/cmd`, { mode: 'auto' }, res);
  if (color === 'blue' || color === 'purple' || color === 'yellow') {
    return brokerPublish(`streetlight/${node}/cmd`, { mode: 'manual', color }, res);
  }
  res.status(400).json({ error: 'only blue, purple, yellow, or auto allowed' });
});

app.post('/api/test', (req, res) => {
  const node = req.body.node || 'node1';
  const sample = { node, light1: 'purple', light2: 'purple', stateCode: '00', state: 'clear', mode: 'manual', distanceCm: 20.5, stableCount: 0, note: 'test manual purple message' };
  aedes.publish({ topic: `streetlight/${node}/state`, payload: Buffer.from(JSON.stringify(sample)), qos: 0, retain: false });
  res.json({ ok: true });
});

broker.listen(MQTT_PORT, '0.0.0.0', () => {
  console.log(`[mqtt] broker on 0.0.0.0:${MQTT_PORT}`);
  console.log('[mqtt] ESP32 mqtt_server must be your laptop IP');
});

web.listen(WEB_PORT, () => {
  console.log(`[web] dashboard http://localhost:${WEB_PORT}`);
  console.log('[web] manual blue/purple fixed version');
});
