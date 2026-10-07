// GavenOS 2000 three.js scene: a PC assembles itself as you scroll, then CDs load projects onto the CRT.
// Procedural stand-ins render first and are swapped for the Blender models in public/models once fetched.
import * as THREE from "three";
import { buildGltf, fetchModels } from "../retro/gltf";

function pcbTexture(T) {
  var c = document.createElement('canvas'); c.width = 1200; c.height = 920;
  var g = c.getContext('2d');
  g.fillStyle = '#0D3A26'; g.fillRect(0, 0, 1200, 920);
  g.strokeStyle = 'rgba(180,242,90,0.35)'; g.lineWidth = 3;
  var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (var i = 0; i < 70; i++) {
    var x = rnd() * 1200, y = rnd() * 920;
    g.beginPath(); g.moveTo(x, y);
    var len = 60 + rnd() * 220, dir = rnd() > 0.5;
    x += dir ? len : 0; y += dir ? 0 : len; g.lineTo(x, y);
    x += 40; y += 40; g.lineTo(x, y);
    x += dir ? 0 : len * 0.6; y += dir ? len * 0.6 : 0; g.lineTo(x, y);
    g.stroke();
    g.fillStyle = '#C9A44A'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = 'bold 30px monospace';
  g.fillText('GAVEN-RB2000  REV 1.0', 60, 880);
  g.fillText('MADE FOR THE WEB', 820, 60);
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.strokeRect(20, 20, 1160, 880);
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
}
function labelTexture(T, p, i) {
  var c = document.createElement('canvas'); c.width = 512; c.height = 512;
  var g = c.getContext('2d');
  g.clearRect(0, 0, 512, 512);
  var grd = g.createRadialGradient(256, 256, 60, 256, 256, 256);
  grd.addColorStop(0, '#F4F4F6'); grd.addColorStop(0.7, '#E2E3E8'); grd.addColorStop(1, '#C9CBD2');
  g.fillStyle = grd; g.beginPath(); g.arc(256, 256, 256, 0, Math.PI * 2); g.fill();
  g.fillStyle = p.color; g.beginPath(); g.arc(256, 256, 256, Math.PI * 1.08, Math.PI * 1.92); g.arc(256, 256, 170, Math.PI * 1.92, Math.PI * 1.08, true); g.fill();
  g.fillStyle = '#9EA1A9'; g.beginPath(); g.arc(256, 256, 74, 0, Math.PI * 2); g.fill();
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(256, 256, 30, 0, Math.PI * 2); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#16203F'; g.textAlign = 'center';
  g.font = '44px "Permanent Marker", cursive';
  var words = p.name.split(' ');
  if (p.name.length > 14 && words.length > 1) {
    var half = Math.ceil(words.length / 2);
    g.fillText(words.slice(0, half).join(' '), 256, 380);
    g.fillText(words.slice(half).join(' '), 256, 428);
  } else { g.fillText(p.name, 256, 400); }
  g.font = '30px "Permanent Marker", cursive';
  g.fillText('TRACK 0' + (i + 1) + '  \u00b7  ' + p.year, 256, 140);
  g.font = '22px "Permanent Marker", cursive'; g.fillStyle = '#C0392B';
  g.fillText('DO NOT SCRATCH!!', 256, 470);
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
}
function drawScreen(g, mode, p, t) {
  var W = 1024, H = 768;
  g.fillStyle = '#050806'; g.fillRect(0, 0, W, H);
  if (mode === 'off') { return; }
  if (mode === 'boot') {
    for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(' + (180 + Math.random() * 75 | 0) + ',255,' + (150 + Math.random() * 100 | 0) + ',' + (Math.random() * 0.5) + ')'; g.fillRect(0, Math.random() * H, W, 2 + Math.random() * 30); }
    g.fillStyle = '#B4F25A'; g.font = '64px VT323, monospace'; g.fillText('READING DISC' + '...'.slice(0, (t * 4 | 0) % 4), 70, 400);
  } else if (mode === 'idle') {
    var grd = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 600); grd.addColorStop(0, '#0F1A0A'); grd.addColorStop(1, '#030503');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = '#B4F25A'; g.font = '56px VT323, monospace';
    g.fillText('GavenOS 2000  [Version 1.0]', 60, 110);
    g.font = '40px VT323, monospace'; g.fillStyle = '#7FAF3E';
    g.fillText('(C) 2026 Gaven Robertson', 60, 160);
    g.fillText('Memory test ......... OK', 60, 250);
    g.fillText('Graphics ............ OK', 60, 295);
    g.fillText('CD-ROM drive ........ READY', 60, 340);
    g.fillStyle = '#B4F25A'; g.font = '60px VT323, monospace';
    g.fillText('C:\\> INSERT DISC AND PRESS PLAY' + ((t * 2 | 0) % 2 ? '_' : ' '), 60, 470);
    g.font = '38px VT323, monospace'; g.fillStyle = '#7FAF3E';
    g.fillText('Pick a CD below, or use the player.', 60, 530);
  } else if (mode === 'play' && p) {
    g.fillStyle = '#D9DCE2'; g.fillRect(0, 0, W, H);
    var tb = g.createLinearGradient(0, 0, 0, 56); tb.addColorStop(0, '#C9F57F'); tb.addColorStop(0.5, '#86C531'); tb.addColorStop(1, '#6FAE1F');
    g.fillStyle = tb; g.fillRect(0, 0, W, 56);
    g.fillStyle = '#0B1406'; g.font = 'bold 28px Geist, sans-serif'; g.fillText(p.name + ' \u2014 Web Browser', 24, 38);
    g.fillStyle = '#D9573A'; g.fillRect(W - 50, 12, 34, 32);
    g.fillStyle = '#FFFFFF'; g.fillRect(20, 72, W - 40, 44); g.strokeStyle = '#9EA1A9'; g.lineWidth = 2; g.strokeRect(20, 72, W - 40, 44);
    g.fillStyle = '#333'; g.font = '30px VT323, monospace'; g.fillText('Address:  ' + p.url, 34, 104);
    g.fillStyle = '#16171B'; g.fillRect(20, 132, W - 40, 420);
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    for (var x = 20; x < W - 20; x += 32) { g.beginPath(); g.moveTo(x, 132); g.lineTo(x, 552); g.stroke(); }
    for (var y = 132; y < 552; y += 32) { g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y); g.stroke(); }
    g.fillStyle = p.color; g.font = '44px VT323, monospace'; g.textAlign = 'center'; g.fillText('[PROJECT SCREENSHOT]', W / 2, 352); g.textAlign = 'left';
    g.fillStyle = '#0B0B0D'; g.font = 'bold 50px Geist, sans-serif'; g.fillText(p.name, 24, 616);
    g.fillStyle = '#44464D'; g.font = '30px Geist, sans-serif'; g.fillText(p.blurb + '  \u00b7  ' + p.stack, 24, 660);
    if ((t * 1.5 | 0) % 2) { g.fillStyle = '#0B0B0D'; g.fillRect(20, 690, 470, 56); g.fillStyle = '#B4F25A'; g.font = '40px VT323, monospace'; g.fillText('\u25BA CLICK SCREEN TO OPEN', 36, 730); }
  }
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (var s = 0; s < H; s += 4) g.fillRect(0, s, W, 2);
  var v = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 720); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
export function createScene({ canvas, stage, track, bg, projects, modelsUrl, onState, isStill }) {
  var T = THREE; if (!canvas || !stage || !track) return null;
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  var disposables = [];
  function keep(x) { disposables.push(x); return x; }

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(40, 1, 0.1, 200);

  // environment for shiny metals
  var pm = new T.PMREMGenerator(renderer);
  var env = new T.Scene();
  var envBox = new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x15161a, side: T.BackSide }));
  env.add(envBox);
  function envPanel(color, x, y, z, w, h) { var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: color, side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); }
  envPanel(0xffffff, 0, 12, 0, 18, 6); envPanel(0xb4f25a, -14, 3, 4, 6, 10); envPanel(0xfff4e0, 14, 4, -4, 6, 10); envPanel(0xffffff, 0, 4, 14, 12, 4);
  var envTex = pm.fromScene(env, 0.04).texture; scene.environment = envTex; keep(envTex);
  env.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pm.dispose();

  scene.add(new T.AmbientLight(0xffffff, 0.35));
  var key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(4, 9, 6); scene.add(key);
  var glow = new T.PointLight(0xb4f25a, 6, 9, 2); glow.position.set(0, 2, 2); scene.add(glow);

  var grid = new T.GridHelper(60, 60, 0x3d5a1a, 0x1b1d22); grid.position.y = -0.02;
  grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid); keep(grid.geometry); keep(grid.material);

  function mat(o) { return keep(new T.MeshStandardMaterial(o)); }
  function box(w, h, d, m) { return new T.Mesh(keep(new T.BoxGeometry(w, h, d)), m); }
  var mBlack = mat({ color: 0x141518, roughness: 0.6, metalness: 0.2 });
  var mSilver = mat({ color: 0xc9ccd2, roughness: 0.25, metalness: 1 });
  var mRamPcb = mat({ color: 0x1d5c34, roughness: 0.6 });
  var mBeige = mat({ color: 0xd8d1bd, roughness: 0.7 });
  var mBeigeDk = mat({ color: 0xc2baa3, roughness: 0.75 });
  var mLime = mat({ color: 0xb4f25a, emissive: 0xb4f25a, emissiveIntensity: 2.2 });
  var mFan = mat({ color: 0xb4f25a, emissive: 0x6fae1f, emissiveIntensity: 0.6, transparent: true, opacity: 0.75, roughness: 0.3 });

  // ---- tower case (fallback shell; replaced by the Blender model when it loads)
  var TH = 4.6, TD = 3.6;
  var tower = new T.Group(); scene.add(tower);
  var towerShell = new T.Group(); tower.add(towerShell);
  [[0.06, TH - 0.2, TD - 0.1, -0.92, TH / 2, 0], [1.9, 0.1, TD, 0, TH - 0.05, 0], [1.9, 0.1, TD, 0, 0.16, 0], [1.9, TH - 0.2, 0.06, 0, TH / 2, -TD / 2 + 0.03], [1.98, TH, 0.24, 0, TH / 2, TD / 2 + 0.06]].forEach(function (b) {
    var mm = box(b[0], b[1], b[2], mBeige); mm.position.set(b[3], b[4], b[5]); towerShell.add(mm);
  });
  var sidePanel = new T.Group(); tower.add(sidePanel);
  sidePanel.add(box(0.05, TH - 0.12, TD, mBeige));
  var panelSeat = new T.Vector3(0.98, TH / 2, 0);

  // ---- motherboard (mounted on the inner wall, components facing the open +x side)
  var board = new T.Group(); tower.add(board);
  board.position.set(-0.8, 1.9, -0.2); board.rotation.set(0, 0, -Math.PI / 2); board.scale.setScalar(0.55);
  var pcbTex = keep(pcbTexture(T));
  var pcb = box(6, 0.12, 4.6, [mat({ color: 0x0d3a26 }), mat({ color: 0x0d3a26 }), mat({ map: pcbTex, roughness: 0.55, metalness: 0.1 }), mat({ color: 0x0d3a26 }), mat({ color: 0x0d3a26 }), mat({ color: 0x0d3a26 })]);
  board.add(pcb);
  var boardBits = new T.Group(); board.add(boardBits);
  var sock = box(1.3, 0.06, 1.3, mat({ color: 0xe8e4d8, roughness: 0.6 })); sock.position.set(-0.6, 0.09, -0.6); boardBits.add(sock);
  [1.95, 2.3].forEach(function (x) { var s = box(0.14, 0.1, 2.9, mBlack); s.position.set(x, 0.11, -0.1); boardBits.add(s); });
  var pcie = box(3.2, 0.1, 0.18, mBlack); pcie.position.set(-0.4, 0.11, 1.6); boardBits.add(pcie);

  // ---- parts
  var cpu = new T.Group(); board.add(cpu); cpu.add(box(1.05, 0.08, 1.05, mSilver));
  var cooler = new T.Group(); board.add(cooler);
  for (var fi = 0; fi < 10; fi++) { var fin = box(1.3, 0.7, 0.04, mSilver); fin.position.set(0, 0.45, -0.6 + fi * 0.133); cooler.add(fin); }
  var fan = new T.Group(); fan.position.y = 0.96; cooler.add(fan);
  for (var bi = 0; bi < 7; bi++) { var bl = box(0.5, 0.02, 0.15, mFan); bl.position.set(Math.cos(bi / 7 * Math.PI * 2) * 0.36, 0, Math.sin(bi / 7 * Math.PI * 2) * 0.36); bl.rotation.y = -bi / 7 * Math.PI * 2; bl.rotation.x = 0.35; fan.add(bl); }
  function ramStick() { var g = new T.Group(); g.add(box(0.05, 0.62, 2.7, mRamPcb)); var led = box(0.07, 0.04, 2.6, mLime); led.position.y = 0.32; g.add(led); return g; }
  var ram1 = ramStick(), ram2 = ramStick(); board.add(ram1); board.add(ram2);
  var gpu = new T.Group(); board.add(gpu);
  gpu.add(box(3.0, 1.1, 0.18, mat({ color: 0x1a1b20, roughness: 0.45, metalness: 0.5 })));
  gpu.userData.fans = [];

  var parts = [
    { o: cpu, a: 0.08, b: 0.17, seat: [-0.6, 0.16, -0.6], from: [-0.6, 7, -0.6], rot: [0, Math.PI, 0] },
    { o: cooler, a: 0.20, b: 0.29, seat: [-0.6, 0.2, -0.6], from: [-3, 7, -2], rot: [0.8, 1.6, 0] },
    { o: ram1, a: 0.30, b: 0.36, seat: [1.95, 0.46, -0.1], from: [1.95, 6, -0.1], rot: [0, 0, 0.7] },
    { o: ram2, a: 0.34, b: 0.40, seat: [2.3, 0.46, -0.1], from: [2.3, 6, -0.1], rot: [0, 0, -0.7] },
    { o: gpu, a: 0.40, b: 0.50, seat: [-0.4, 0.71, 1.6], from: [-2, 7, 6], rot: [0.4, -1.2, 0.3] }
  ];

  // ---- CD-ROM drive: lives in the tower's top 5.25" bay
  var drive = new T.Group(); tower.add(drive);
  drive.scale.setScalar(0.8);
  drive.add(box(2.0, 0.55, 2.0, mBeige));
  var tray = new T.Group(); drive.add(tray);
  tray.add(box(1.8, 0.07, 1.9, mBlack));
  var driveSeat = new T.Vector3(0, TH - 0.62, TD / 2 - 0.78), driveFrom = new T.Vector3(0, TH - 0.62, TD / 2 + 6);

  // ---- CRT monitor
  var monitor = new T.Group(); scene.add(monitor);
  var bezel = box(3.5, 2.85, 0.36, mBeige); bezel.position.y = 1.85; monitor.add(bezel);
  var backBox = box(2.7, 2.25, 1.7, mBeigeDk); backBox.position.set(0, 1.8, -1.0); monitor.add(backBox);
  var base = box(1.7, 0.14, 1.4, mBeige); base.position.set(0, 0.07, -0.6); monitor.add(base);
  var scrCanvas = document.createElement('canvas'); scrCanvas.width = 1024; scrCanvas.height = 768;
  var scrCtx = scrCanvas.getContext('2d');
  var scrTex = keep(new T.CanvasTexture(scrCanvas)); scrTex.colorSpace = T.SRGBColorSpace;
  var screen = new T.Mesh(keep(new T.PlaneGeometry(2.95, 2.25)), keep(new T.MeshBasicMaterial({ map: scrTex, toneMapped: false })));
  screen.position.set(0, 1.88, 0.185); monitor.add(screen);
  var scrGlow = new T.PointLight(0xb4f25a, 0, 6, 2); scrGlow.position.set(0, 1.9, 1.2); monitor.add(scrGlow);

  // ---- keyboard + mouse
  var keyboard = new T.Group(); scene.add(keyboard);
  var kbBody = box(4.5, 0.2, 1.6, mBeige); kbBody.position.y = 0.12; keyboard.add(kbBody);
  var mouseObj = new T.Group(); scene.add(mouseObj);
  var msBody = box(0.7, 0.2, 1.0, mBeige); msBody.position.y = 0.12; mouseObj.add(msBody);

  // ---- discs
  var n = projects.length;
  var discGeo = keep(new T.CylinderGeometry(0.78, 0.78, 0.035, 72));
  var mDiscSide = mat({ color: 0xdfe3ea, metalness: 1, roughness: 0.15 });
  var mDiscBottom = keep(new T.MeshPhysicalMaterial({ color: 0xeef2f8, metalness: 1, roughness: 0.08, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 900] }));
  var discs = [];
  for (var di = 0; di < n; di++) {
    var lt = keep(labelTexture(T, projects[di], di));
    var top = keep(new T.MeshStandardMaterial({ map: lt, transparent: true, alphaTest: 0.5, roughness: 0.35, metalness: 0.25 }));
    var d = new T.Mesh(discGeo, [mDiscSide, top, mDiscBottom]);
    d.rotation.order = 'XYZ'; d.userData.idx = di; d.visible = false;
    scene.add(d); discs.push({ mesh: d, spin: 0, labelTex: lt, labelMat: top });
  }
  try { if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('40px "Permanent Marker"'), document.fonts.load('40px VT323')]).then(function () { if (!alive) return; lastMode = ''; discs.forEach(function (o, i) { var nt = labelTexture(T, projects[i], i); o.labelMat.map = nt; o.labelMat.needsUpdate = true; o.labelTex.dispose(); o.labelTex = nt; disposables.push(nt); }); }); } } catch (e) {}

  // ---- Blender models (public/models), swapped in over the fallback shapes once fetched
  function clearKids(g) { while (g.children.length) g.remove(g.children[0]); }
  function adopt(group, node) { if (!node) return null; node.removeFromParent(); node.position.set(0, 0, 0); node.quaternion.identity(); clearKids(group); group.add(node); return node; }
  function onModels(R) {
    var N = function (nm) { return R.getObjectByName(nm); };
    var nCPU = N('CPU'), nCool = N('Cooler'), nRam = N('RAM'), nGpu = N('GPU'), nDrive = N('Drive'), nMon = N('Monitor'), nBoard = N('BoardDetail');
    var nTower = N('Tower'), nKb = N('Keyboard'), nMouse = N('Mouse');
    if (nCPU) adopt(cpu, nCPU);
    if (nCool) { adopt(cooler, nCool); fan = nCool.getObjectByName('Fan') || fan; }
    if (nRam) { var r2 = nRam.clone(); adopt(ram1, nRam); adopt(ram2, r2); }
    if (nGpu) { adopt(gpu, nGpu); gpu.userData.fans = [nGpu.getObjectByName('GPUFanA'), nGpu.getObjectByName('GPUFanB')].filter(Boolean); }
    if (nBoard) { nBoard.removeFromParent(); board.remove(boardBits); board.add(nBoard); }
    if (nDrive) { adopt(drive, nDrive); tray = nDrive.getObjectByName('Tray') || tray; }
    if (nTower) {
      var nPanel = nTower.getObjectByName('SidePanel');
      if (nPanel) { panelSeat.copy(nPanel.position); nPanel.removeFromParent(); clearKids(sidePanel); nPanel.position.set(0, 0, 0); sidePanel.add(nPanel); }
      adopt(towerShell, nTower);
    }
    if (nKb) { var q = nKb.quaternion.clone(); adopt(keyboard, nKb); nKb.quaternion.copy(q); }
    if (nMouse) adopt(mouseObj, nMouse);
    if (nMon) {
      var scrMat = screen.material;
      adopt(monitor, nMon); monitor.add(scrGlow);
      var ns = nMon.getObjectByName('Screen');
      if (ns) { ns.material = scrMat; scrTex.flipY = false; scrTex.needsUpdate = true; screen = ns; lastMode = ''; }
    }
  }
  fetchModels(modelsUrl)
    .then(function (data) { if (alive) { onModels(buildGltf(T, data, keep, mBeige)); kick(); } })
    .catch(function (err) { console.warn('GavenOS: model load failed, keeping the fallback shapes', err); });

  // ---- interaction state
  var selected = 0, loaded = -1, seq = null, lastDraw = -1, lastMode = '';
  var mouse = new T.Vector2(0, 0), mouseS = new T.Vector2(0, 0), ndc = new T.Vector2(), ray = new T.Raycaster();
  var p = 0, pS = 0, lastStep = -1, lastPct = -1, finalReady = false;
  var clock = new T.Clock(), alive = true, raf = 0, visible = true;

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(x, a, b) { return clamp((x - a) / (b - a), 0, 1); }
  function sm(x) { return x * x * (3 - 2 * x); }
  function back(x) { var c1 = 1.70158, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function lerp(a, b, k) { return a + (b - a) * k; }

  function notify() { onState({ selected: selected, loaded: loaded, phase: seq ? seq.type : (loaded >= 0 ? 'play' : 'idle') }); }
  function select(i) { selected = ((i % n) + n) % n; notify(); }
  function play() {
    if (seq) return;
    if (loaded === selected) { return; }
    seq = { type: 'load', idx: selected, t0: clock.getElapsedTime(), prev: loaded };
    loaded = -1; notify();
  }
  function eject() {
    if (seq || loaded < 0) return;
    seq = { type: 'eject', idx: loaded, t0: clock.getElapsedTime() };
    loaded = -1; notify();
  }
  function openLoaded() {
    if (loaded < 0) return;
    var u = projects[loaded].url || '#';
    if (/^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else { try { window.location.hash = u.replace(/^#?/, '#'); } catch (e) {} }
  }

  var stageEl = stage, trackEl = track;
  function pickables() { return discs.map(function (o) { return o.mesh; }).concat([screen]); }
  function hitTest(e) {
    var r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(pickables(), true);
    return hits.length ? hits[0].object : null;
  }
  function onMove(e) {
    var r = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!finalReady) { setCursor('default'); return; }
    var o = hitTest(e);
    setCursor(o && (o !== screen || loaded >= 0) ? 'pointer' : 'default');
  }
  function onClick(e) {
    if (!finalReady) return;
    var o = hitTest(e);
    if (!o) return;
    if (o === screen) { openLoaded(); return; }
    var i = o.userData.idx;
    if (i == null) return;
    if (i === selected && loaded !== i) { play(); } else { select(i); }
  }
  var curCursor = 'default';
  function setCursor(c) { if (c !== curCursor) { curCursor = c; canvas.style.cursor = c; } }
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('click', onClick);

  function resize() {
    var w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < 760 ? 58 : 40; camera.updateProjectionMatrix();
  }
  var ro = new ResizeObserver(resize); ro.observe(stageEl);
  var io2 = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }); io2.observe(stageEl);

  function readProgress() {
    var r = trackEl.getBoundingClientRect();
    var total = r.height - stageEl.clientHeight;
    if (total <= 0) return 0;
    return clamp((72 - r.top) / total, 0, 1);
  }

  var camA = new T.Vector3(), camB = new T.Vector3(), lookA = new T.Vector3(), lookB = new T.Vector3(), camP = new T.Vector3(), lookP = new T.Vector3();
  var tmp = new T.Vector3();
  var focusK = 0, camF = new T.Vector3(), scrPos = new T.Vector3(), scrDir = new T.Vector3();
  var towerDesk = new T.Vector3(4.1, 0, -1.4), monDesk = new T.Vector3(-1.2, 0, -1.5);
  var kbDesk = new T.Vector3(-1.0, 0, 1.35), msDesk = new T.Vector3(1.9, 0, 1.5);

  function frame() {
    raf = 0; if (!alive) return;
    var t = clock.getElapsedTime(), still = isStill();
    p = readProgress();
    pS += (p - pS) * (still ? 1 : 0.1);
    var P = pS;

    // DOM sync
    var step = P < 0.08 ? 0 : P < 0.2 ? 1 : P < 0.3 ? 2 : P < 0.4 ? 3 : P < 0.5 ? 4 : P < 0.6 ? 5 : P < 0.78 ? 6 : 7;
    var pct = Math.round(clamp(P / 0.78, 0, 1) * 100);
    if (step !== lastStep || pct !== lastPct) { lastStep = step; lastPct = pct; onState({ step: step, pct: pct }); }
    finalReady = P > 0.86;
    if (bg) bg.style.transform = 'translate(' + (-P * 55) + '%, -50%)';

    // parts fly in through the open side of the case
    for (var i = 0; i < parts.length; i++) {
      var pr = parts[i], k = back(seg(P, pr.a, pr.b));
      pr.o.visible = P > pr.a - 0.005;
      pr.o.position.set(lerp(pr.from[0], pr.seat[0], k), lerp(pr.from[1], pr.seat[1], k), lerp(pr.from[2], pr.seat[2], k));
      pr.o.rotation.set(pr.rot[0] * (1 - k), pr.rot[1] * (1 - k), pr.rot[2] * (1 - k));
    }
    if (!still) { fan.rotation.y += 0.25; (gpu.userData.fans || []).forEach(function (f) { f.rotation.z += 0.2; }); }

    // CD-ROM slides into the front bay
    var kd = sm(seg(P, 0.5, 0.6));
    drive.visible = P > 0.495;
    drive.position.copy(driveFrom).lerp(driveSeat, kd);
    drive.rotation.set(0, (1 - kd) * 0.6, 0);

    // side panel slides shut
    var kp = sm(seg(P, 0.6, 0.67));
    sidePanel.visible = P > 0.595;
    sidePanel.position.set(panelSeat.x + (1 - kp) * 0.6, panelSeat.y, panelSeat.z - (1 - kp) * 4.2);

    // tower walks to the desk
    var kt = sm(seg(P, 0.64, 0.77));
    tower.position.set(0, 0, 0).lerp(towerDesk, kt);
    tower.rotation.y = lerp(still ? 0 : Math.sin(t * 0.25) * 0.04, -0.3, kt);
    board.getWorldPosition(tmp); glow.position.set(tmp.x + 1.5, tmp.y + 1, tmp.z + 1.5);
    glow.intensity = 6 * (1 - kp);

    // monitor, keyboard, mouse
    var km = back(seg(P, 0.66, 0.78));
    monitor.visible = km > 0;
    monitor.position.set(monDesk.x, lerp(-6, 0, km), monDesk.z);
    monitor.rotation.y = 0.08;
    var kk1 = back(seg(P, 0.7, 0.8)), kk2 = back(seg(P, 0.72, 0.82));
    keyboard.visible = kk1 > 0; mouseObj.visible = kk2 > 0;
    keyboard.position.set(kbDesk.x, kbDesk.y, lerp(kbDesk.z + 6, kbDesk.z, kk1));
    mouseObj.position.set(lerp(msDesk.x + 5, msDesk.x, kk2), msDesk.y, msDesk.z);
    mouseObj.rotation.y = -0.15;

    // camera: orbit the open case, then pull back to the desk
    var pp = seg(P, 0, 0.62), ang = lerp(1.05, 1.55, pp), rad = lerp(7.2, 6.4, pp);
    camA.set(Math.sin(ang) * rad, lerp(5.2, 3.6, pp), Math.cos(ang) * rad); lookA.set(-0.2, lerp(2.6, 2.3, pp), 0);
    var wide = camera.aspect >= 1.5;
    camB.set(wide ? -0.85 : 0.6, 3.0, wide ? 10.9 : 15); lookB.set(wide ? -0.85 : 0.6, 1.6, -0.6);
    var kc = sm(seg(P, 0.62, 0.8));
    camP.copy(camA).lerp(camB, kc); lookP.copy(lookA).lerp(lookB, kc);
    // zoom into the CRT once the disc is in, so the project fills the view
    var eNow = seq ? (t - seq.t0) * (still ? 3 : 1) : 0;
    var wantFocus = P > 0.86 && (loaded >= 0 || (seq && seq.type === 'load' && eNow >= 1.4)) ? 1 : 0;
    focusK += (wantFocus - focusK) * (still ? 1 : 0.055);
    if (focusK > 0.001) {
      screen.getWorldPosition(scrPos); screen.getWorldDirection(scrDir);
      var half = Math.tan(camera.fov * Math.PI / 360);
      var dist = Math.max((3.05 / 0.94) / 2 / half, (2.95 / 0.92) / 2 / (half * camera.aspect)) + 0.05;
      scrPos.y -= 0.38;
      camF.copy(scrPos).addScaledVector(scrDir, dist);
      var fk = focusK * focusK * (3 - 2 * focusK);
      camP.lerp(camF, fk); lookP.lerp(scrPos, fk);
    }
    mouseS.lerp(mouse, 0.05);
    if (!still) { camP.x += mouseS.x * 0.5 * (1 - focusK); camP.y += mouseS.y * 0.3 * (1 - focusK); }
    camera.position.copy(camP); camera.lookAt(lookP);

    // tray + discs
    var trayOut = 0, seqDisc = -1, seqPos = null, seqFlat = 0, e = 0;
    function trayWorld(out) { tray.position.z = out * 1.7; drive.updateWorldMatrix(true, true); return tray.localToWorld(new T.Vector3(0, 0.07, 0.05)); }
    if (seq) {
      e = (t - seq.t0) * (still ? 3 : 1);
      seqDisc = seq.idx;
      var rack = rackPos(seq.idx, t, true);
      if (seq.type === 'load') {
        if (e < 0.45) { trayOut = e / 0.45; seqPos = rack; seqFlat = 0; }
        else if (e < 1.1) { trayOut = 1; var kq = sm((e - 0.45) / 0.65); seqPos = rack.clone().lerp(trayWorld(1), kq); seqPos.y += Math.sin(kq * Math.PI) * 1.0; seqFlat = kq; }
        else if (e < 1.55) { trayOut = 1 - (e - 1.1) / 0.45; seqPos = trayWorld(trayOut); seqFlat = 1; }
        else if (e < 2.4) { trayOut = 0; seqPos = null; }
        else { loaded = seq.idx; seq = null; notify(); }
      } else {
        if (e < 0.45) { trayOut = e / 0.45; seqPos = trayWorld(trayOut); seqFlat = 1; }
        else if (e < 1.1) { trayOut = 1; var kr = sm((e - 0.45) / 0.65); seqPos = trayWorld(1).lerp(rack, kr); seqPos.y += Math.sin(kr * Math.PI) * 1.0; seqFlat = 1 - kr; }
        else if (e < 1.5) { trayOut = 1 - (e - 1.1) / 0.4; seqPos = rack; seqFlat = 0; }
        else { seq = null; notify(); }
      }
    }
    tray.position.z = trayOut * 1.7;

    for (var j = 0; j < n; j++) {
      var D = discs[j], m = D.mesh;
      var ke = back(seg(P, 0.78 + j * 0.02, 0.85 + j * 0.02));
      if (ke <= 0) { m.visible = false; continue; }
      if (j === seqDisc && seq) {
        if (!seqPos) { m.visible = false; continue; }
        m.visible = true; m.position.copy(seqPos);
        D.spin += still ? 0 : 0.08;
        m.rotation.set(lerp(Math.PI / 2 - 0.15, 0, seqFlat), lerp(D.spin, tower.rotation.y, seqFlat), 0);
        m.scale.setScalar(lerp(1, 0.8, seqFlat));
        continue;
      }
      m.scale.setScalar(1);
      if (j === loaded) { m.visible = false; continue; }
      m.visible = true;
      var target = rackPos(j, t, false);
      target.y -= (1 - ke) * 7;
      if (ke < 1) m.position.copy(target); else m.position.lerp(target, 0.15);
      if (j === selected && !still) D.spin += 0.05; else D.spin *= 0.92;
      m.rotation.set(Math.PI / 2 - 0.15, D.spin, 0);
    }

    // screen
    var wantMode = seq && seq.type === 'load' && e >= 1.55 ? 'boot' : (loaded >= 0 ? 'play' : (km > 0.98 ? 'idle' : 'off'));
    var tick = wantMode === 'boot' ? Math.floor(t * 20) : Math.floor(t * 2);
    if (wantMode !== lastMode || tick !== lastDraw) {
      lastMode = wantMode; lastDraw = tick;
      drawScreen(scrCtx, wantMode, loaded >= 0 ? projects[loaded] : null, t);
      scrTex.needsUpdate = true;
    }
    scrGlow.intensity = wantMode === 'off' ? 0 : 3;

    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(frame);
  }
  // discs: a 2x2 "CD wallet" left of the monitor on wide screens, a row in front on narrower ones
  function rackPos(i, t, ignoreSel) {
    var sel = (i === selected && !ignoreSel), bob = isStill() ? 0 : Math.sin(t * 1.4 + i) * 0.05;
    if (camera.aspect < 1.5) {
      return new T.Vector3(0.6 + (i - (n - 1) / 2) * 1.75, 0.95 + (sel ? 0.4 : 0) + bob, 3.8);
    }
    var col = i % 2, row = Math.floor(i / 2);
    return new T.Vector3(-6.1 + col * 1.75, 2.75 - row * 1.75 + bob, 0.4 + (sel ? 0.9 : 0));
  }
  function kick() { if (!raf && alive) raf = requestAnimationFrame(frame); }
  function onScroll() { kick(); }
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });

  resize(); kick();
  return {
    select: select, play: play, eject: eject, open: openLoaded,
    step: function (d) { select(selected + d); },
    // lighter grid floor on the light theme
    setTheme: function (light) { grid.material.opacity = light ? 0.3 : 0.55; kick(); },
    dispose: function () {
      alive = false; if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io2.disconnect();
      window.removeEventListener('scroll', onScroll, { capture: true });
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('click', onClick);
      disposables.forEach(function (x) { try { x.dispose(); } catch (err) {} });
      renderer.dispose();
    }
  };
}
