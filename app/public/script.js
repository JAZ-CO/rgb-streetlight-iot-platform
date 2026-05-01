let nodes = {};
let log = [];

const el = id => document.getElementById(id);

function lampClass(color) {
  if (color === 'green') return 'green';
  if (color === 'yellow') return 'yellowLamp';
  if (color === 'red') return 'red';
  if (color === 'blue') return 'blue';
  if (color === 'purple') return 'purple';
  return 'off';
}

function stateColor(code) {
  if (code === '00') return '#22c55e';
  if (code === '01') return '#facc15';
  if (code === '10') return '#ef4444';
  if (code === '11') return '#ef4444';
  return '#94a3b8';
}

function nodeCard(item) {
  const d = item.data || {};
  const node = item.node;
  const c1 = d.light1 || d.ledColor || 'off';
  const c2 = d.light2 || d.ledColor || 'off';

  return `
    <div class="card" style="border-left:8px solid ${stateColor(d.stateCode)}">
      <div class="title">
        <div>
          <div class="code">${d.stateCode || '--'}</div>
          <div class="state">${d.state || 'unknown'}</div>
        </div>
        <b>${node}</b>
      </div>

      <div class="lamps">
        ${lamp(c1, 'LED 1')}
        ${lamp(c2, 'LED 2')}
      </div>

      <div class="grid">
        <div class="box"><small>Distance</small>${d.distanceCm ?? '-'} cm</div>
        <div class="box"><small>Stable count</small>${d.stableCount ?? '-'}</div>
        <div class="box"><small>Mode</small>${d.mode || 'auto'}</div>
        <div class="box"><small>LED color</small>${c1}</div>
        <div class="box"><small>Last update</small>${item.time}</div>
      </div>

      <div class="controls">
        <button onclick="cmd('${node}','blue')">Blue</button>
        <button class="purpleBtn" onclick="cmd('${node}','purple')">Purple</button>
        <button class="yellow" onclick="cmd('${node}','yellow')">Yellow</button>
        <button class="auto" onclick="autoMode('${node}')">Auto</button>
      </div>
    </div>
  `;
}

function lamp(color, name) {
  return `
    <div class="pole">
      <div class="head ${lampClass(color)}"></div>
      <div>${name}</div>
      <div class="stem"></div>
      <div class="base"></div>
    </div>
  `;
}

function msg(item) {
  const d = item.data || {};
  return `
    <div class="msg">
      <b>#${item.id}</b> ${item.time} - ${item.node}
      <span>${d.stateCode || '--'} ${d.state || ''}</span>
      <small>${item.topic}</small>
      <pre>${JSON.stringify(d, null, 2)}</pre>
    </div>
  `;
}

function render(data) {
  nodes = data.nodes || nodes;
  log = data.log || log;
  const st = data.status || {};

  el('nodeCount').textContent = `Nodes: ${st.nodes || Object.keys(nodes).length}`;
  el('msgCount').textContent = `Messages: ${st.messages || log.length}`;
  el('clientCount').textContent = `MQTT clients: ${st.mqttClients || 0}`;

  const list = Object.values(nodes).reverse();
  el('nodes').className = list.length ? 'nodes' : 'nodes empty';
  el('nodes').innerHTML = list.length ? list.map(nodeCard).join('') : 'Waiting for ESP32 nodes...';

  el('log').className = log.length ? 'log' : 'log empty';
  el('log').innerHTML = log.length ? log.map(msg).join('') : 'No MQTT state messages yet.';
}

async function cmd(node, color) {
  await fetch('/api/cmd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node, color })
  });
}

async function autoMode(node) {
  await fetch('/api/cmd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node, mode: 'auto' })
  });
}

function clearLog() {
  log = [];
  render({ nodes, log, status: {} });
}

const events = new EventSource('/events');
events.addEventListener('message', e => render(JSON.parse(e.data)));
events.addEventListener('status', e => render({ nodes, log, status: JSON.parse(e.data) }));
