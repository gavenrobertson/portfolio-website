// GavenNET Lab three.js scene: a network rack fills up as you scroll, then patch cables load projects onto the terminal.
// Procedural stand-ins render first and are swapped for the Blender models in public/models once fetched.
import * as THREE from "three";
import { buildGltf, fetchModels } from "../retro/gltf";

function tagTexture(T, p) {
  var c = document.createElement('canvas'); c.width = 512; c.height = 160;
  var g = c.getContext('2d');
  g.fillStyle = '#ECEAE2'; g.beginPath();
  if (g.roundRect) g.roundRect(4, 4, 504, 152, 18); else g.rect(4, 4, 504, 152);
  g.fill();
  g.fillStyle = p.color; g.fillRect(4, 4, 36, 152);
  g.fillStyle = '#15161A'; g.font = 'bold 50px VT323, monospace'; g.fillText('VLAN ' + p.vlan, 60, 62);
  g.font = '600 40px Geist, sans-serif'; g.fillText(p.name, 60, 124);
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
}
function drawScreen(g, mode, projects, li, t, bootE) {
  var W = 1024, H = 768, p = li >= 0 ? projects[li] : null;
  g.fillStyle = '#050806'; g.fillRect(0, 0, W, H);
  if (mode === 'off') return;
  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s.slice(0, n); }
  if (mode === 'idle') {
    var grd = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 620); grd.addColorStop(0, '#0F1A0A'); grd.addColorStop(1, '#030503');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = '#B4F25A'; g.font = '46px VT323, monospace';
    g.fillText('GavenOS 2000 \u00b7 Network Edition', 40, 70);
    g.fillStyle = '#7FAF3E'; g.fillText('GR-RTR1 con0 is now available', 40, 116);
    g.fillStyle = '#B4F25A'; g.fillText('GR-RTR1#show vlan brief', 40, 196);
    g.fillStyle = '#7FAF3E'; g.font = '38px VT323, monospace';
    g.fillText('VLAN Name                 Status    Ports', 40, 246);
    g.fillText('---- -------------------- --------- -------', 40, 282);
    g.fillText('1    default              active    Fa0/1-11', 40, 322);
    for (var i = 0; i < projects.length; i++) {
      g.fillStyle = projects[i].color;
      g.fillText(pad(projects[i].vlan, 5) + pad(projects[i].name, 21) + 'standby   Fa0/' + (13 + i), 40, 362 + i * 40);
    }
    g.fillStyle = '#B4F25A'; g.font = '46px VT323, monospace';
    g.fillText('GR-RTR1#' + ((t * 2 | 0) % 2 ? '_' : ' '), 40, 560);
    g.fillStyle = '#7FAF3E'; g.font = '38px VT323, monospace';
    g.fillText('! Patch a VLAN into the switch to load a project', 40, 610);
  } else if (mode === 'boot' && p) {
    var lines = [
      ['%LINK-3-UPDOWN: Interface Fa0/' + (13 + li) + ', changed state to up', '#7FAF3E'],
      ['%LINEPROTO-5-UPDOWN: Line protocol on Interface', '#7FAF3E'],
      ['   Vlan' + p.vlan + ', changed state to up', '#7FAF3E'],
      ['GR-RTR1#connect vlan' + p.vlan, '#B4F25A'],
      ['Trying ' + p.name + ' ... Open', '#B4F25A']
    ];
    g.font = '40px VT323, monospace';
    var shown = Math.min(lines.length, Math.floor(bootE * 7));
    for (var k = 0; k < shown; k++) { g.fillStyle = lines[k][1]; g.fillText(lines[k][0], 40, 90 + k * 52); }
    var pr = Math.max(0, Math.min(1, (bootE - 0.6) / 0.9));
    g.strokeStyle = p.color; g.lineWidth = 4; g.strokeRect(40, 420, 944, 50);
    g.fillStyle = p.color; g.fillRect(48, 428, 928 * pr, 34);
    g.fillStyle = '#B4F25A'; g.font = '44px VT323, monospace'; g.fillText('Loading ' + p.name + ' \u2026 ' + Math.round(pr * 100) + '%', 40, 530);
  } else if (mode === 'play' && p) {
    g.fillStyle = '#D9DCE2'; g.fillRect(0, 0, W, H);
    var tb = g.createLinearGradient(0, 0, 0, 64); tb.addColorStop(0, '#C9F57F'); tb.addColorStop(0.5, '#86C531'); tb.addColorStop(1, '#6FAE1F');
    g.fillStyle = tb; g.fillRect(0, 0, W, 64);
    g.fillStyle = '#0B1406'; g.font = 'bold 34px Geist, sans-serif'; g.fillText(p.name + ' \u2014 Web Browser', 24, 44);
    g.fillStyle = '#D9573A'; g.fillRect(W - 56, 14, 38, 36);
    g.fillStyle = '#FFFFFF'; g.fillRect(20, 80, W - 40, 50); g.strokeStyle = '#9EA1A9'; g.lineWidth = 2; g.strokeRect(20, 80, W - 40, 50);
    g.fillStyle = '#333'; g.font = '36px VT323, monospace'; g.fillText('Address:  ' + p.url, 36, 116);
    g.fillStyle = '#16171B'; g.fillRect(20, 146, W - 40, 380);
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    for (var x = 20; x < W - 20; x += 32) { g.beginPath(); g.moveTo(x, 146); g.lineTo(x, 526); g.stroke(); }
    for (var y = 146; y < 526; y += 32) { g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y); g.stroke(); }
    g.fillStyle = p.color; g.font = '52px VT323, monospace'; g.textAlign = 'center'; g.fillText('[PROJECT SCREENSHOT]', W / 2, 350); g.textAlign = 'left';
    g.fillStyle = p.color; g.fillRect(W - 220, 162, 184, 52);
    g.fillStyle = '#0B0B0D'; g.font = 'bold 34px VT323, monospace'; g.fillText('VLAN ' + p.vlan, W - 196, 198);
    g.fillStyle = '#0B0B0D'; g.font = 'bold 58px Geist, sans-serif'; g.fillText(p.name, 24, 596);
    g.fillStyle = '#44464D'; g.font = '34px Geist, sans-serif'; g.fillText(p.blurb + '  \u00b7  ' + p.stack, 24, 646);
    if ((t * 1.5 | 0) % 2) { g.fillStyle = '#0B0B0D'; g.fillRect(20, 680, 520, 62); g.fillStyle = '#B4F25A'; g.font = '46px VT323, monospace'; g.fillText('\u25ba CLICK SCREEN TO OPEN', 36, 724); }
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
  var camera = new T.PerspectiveCamera(40, 1, 0.05, 200);

  var pm = new T.PMREMGenerator(renderer);
  var env = new T.Scene();
  env.add(new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x15161a, side: T.BackSide })));
  function envPanel(color, x, y, z, w, h) { var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: color, side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); }
  envPanel(0xffffff, 0, 12, 0, 18, 6); envPanel(0xb4f25a, -14, 3, 4, 6, 10); envPanel(0xfff4e0, 14, 4, -4, 6, 10); envPanel(0xffffff, 0, 4, 14, 12, 4);
  var envTex = pm.fromScene(env, 0.04).texture; scene.environment = envTex; keep(envTex);
  env.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pm.dispose();

  scene.add(new T.AmbientLight(0xffffff, 0.55)); scene.add(new T.HemisphereLight(0xf2f6ff, 0x20242a, 0.9));
  var fill = new T.DirectionalLight(0xffffff, 1.3); fill.position.set(-1, 3, 12); scene.add(fill);
  var rim = new T.PointLight(0xb4f25a, 8, 7, 2); rim.position.set(1.6, 3.6, 2.6); scene.add(rim);
  var key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(3, 9, 7); scene.add(key);
  var grid = new T.GridHelper(60, 60, 0x3d5a1a, 0x1b1d22); grid.position.y = -0.01;
  grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid); keep(grid.geometry); keep(grid.material);

  function mat(o) { return keep(new T.MeshStandardMaterial(o)); }
  function box(w, h, d, m) { return new T.Mesh(keep(new T.BoxGeometry(w, h, d)), m); }
  var mRack = mat({ color: 0x1e2025, roughness: 0.45, metalness: 0.6 });
  var mFace = mat({ color: 0x2a2d33, roughness: 0.4, metalness: 0.5 });
  var mBeige = mat({ color: 0xd8d1bd, roughness: 0.65 });
  var mDesk = mat({ color: 0xb9b6ad, roughness: 0.55 });
  var mClear = mat({ color: 0xdfe8ee, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 });
  var mGold = mat({ color: 0xd4a94a, roughness: 0.3, metalness: 1 });
  var ledOn = keep(new T.MeshBasicMaterial({ color: 0xb4f25a, toneMapped: false }));
  var ledAmb = keep(new T.MeshBasicMaterial({ color: 0xffb238, toneMapped: false }));
  var ledOff = keep(new T.MeshBasicMaterial({ color: 0x24301a }));

  // ---------- layout constants
  var RX = 1.6, FRONT = 1.04, U = 0.22, BASE = 0.35;
  function uy(u, h) { return BASE + (u + h / 2) * U; }
  var Y = { server: uy(1, 2), router: uy(5, 1), sw: uy(8, 1), mgr: uy(9, 1), patch: uy(10, 1) };
  function swPort(k) { return new T.Vector3(RX - 0.95 + Math.floor(k / 2) * 0.1, Y.sw + 0.045 - (k % 2) * 0.09, FRONT + 0.012); }
  function ppPort(k) { return new T.Vector3(RX - 0.98 + k * 0.085, Y.patch - 0.015, FRONT + 0.012); }
  function rtPort(r) { return new T.Vector3(RX - 0.5 + r * 0.11, Y.router, FRONT + 0.012); }
  var rtConsole = new T.Vector3(RX + 0.3, Y.router, FRONT + 0.014);
  var svNic = new T.Vector3(RX + 0.9, Y.server - 0.1, FRONT + 0.012);

  // ---------- rack + devices (procedural stand-ins, swapped for the Blender models when they load)
  var rack = new T.Group(); rack.position.set(RX, 0, 0); scene.add(rack);
  [[-1.17, -1.12], [1.17, -1.12], [-1.17, 1.12], [1.17, 1.12]].forEach(function (c) { var po = box(0.1, 4.0, 0.1, mRack); po.position.set(c[0], 2.05, c[1]); rack.add(po); });
  var rTop = box(2.5, 0.1, 2.4, mRack); rTop.position.y = 4.05; rack.add(rTop);
  var rBot = box(2.5, 0.22, 2.4, mRack); rBot.position.y = 0.15; rack.add(rBot);
  function device(h, d) { var g = new T.Group(); var b = box(2.12, h - 0.01, d, mRack); b.position.z = -d / 2; g.add(b); var f = box(2.16, h, 0.03, mFace); f.position.z = -0.015; g.add(f); scene.add(g); g.visible = false; return g; }
  var devPatch = device(0.2, 0.25), devMgr = device(0.2, 0.05), devSw = device(0.2, 1.6), devRt = device(0.2, 1.8), devSv = device(0.42, 2.0);
  var devices = [
    { o: devPatch, y: Y.patch, a: 0.08, b: 0.16 },
    { o: devMgr, y: Y.mgr, a: 0.12, b: 0.19 },
    { o: devSw, y: Y.sw, a: 0.2, b: 0.29 },
    { o: devRt, y: Y.router, a: 0.3, b: 0.39 },
    { o: devSv, y: Y.server, a: 0.4, b: 0.49 }
  ];
  // switch port LEDs
  var leds = [];
  for (var k = 0; k < 24; k++) {
    var lp = swPort(k), le = new T.Mesh(keep(new T.BoxGeometry(0.022, 0.012, 0.006)), ledOff);
    le.position.set(lp.x - RX + 0.026, lp.y - Y.sw + (k % 2 === 0 ? 0.043 : -0.043), 0.006);
    devSw.add(le); leds.push(le);
  }

  // ---------- desk with the terminal
  var deskRig = new T.Group(); scene.add(deskRig);
  var desk = new T.Group(); deskRig.add(desk);
  var dTop = box(3.8, 0.12, 2.1, mDesk); dTop.position.y = 2.94; desk.add(dTop);
  [[-1.75, -0.9], [1.75, -0.9], [-1.75, 0.9], [1.75, 0.9]].forEach(function (c) { var l = box(0.1, 2.88, 0.1, mRack); l.position.set(c[0], 1.44, c[1]); desk.add(l); });
  var DESKX = -2.2, DESKTOP = 3.0, MS = 0.55;
  var monitor = new T.Group(); monitor.position.set(0, DESKTOP, -0.3); monitor.scale.setScalar(MS); deskRig.add(monitor);
  var mb = box(3.5, 2.85, 0.36, mBeige); mb.position.y = 1.85; monitor.add(mb);
  var mbk = box(2.7, 2.25, 1.7, mBeige); mbk.position.set(0, 1.8, -1.0); monitor.add(mbk);
  var scrCanvas = document.createElement('canvas'); scrCanvas.width = 1024; scrCanvas.height = 768;
  var scrCtx = scrCanvas.getContext('2d');
  var scrTex = keep(new T.CanvasTexture(scrCanvas)); scrTex.colorSpace = T.SRGBColorSpace;
  var screen = new T.Mesh(keep(new T.PlaneGeometry(2.95, 2.25)), keep(new T.MeshBasicMaterial({ map: scrTex, toneMapped: false })));
  screen.position.set(0, 1.88, 0.185); monitor.add(screen);
  var scrGlow = new T.PointLight(0xb4f25a, 0, 5, 2); scrGlow.position.set(0, 1.9, 1.6); monitor.add(scrGlow);
  var keyboard = new T.Group(); keyboard.position.set(-0.1, DESKTOP, 0.55); keyboard.scale.setScalar(MS); deskRig.add(keyboard);
  var kbb = box(4.5, 0.2, 1.6, mBeige); kbb.position.y = 0.12; keyboard.add(kbb);
  var mouseObj = new T.Group(); mouseObj.position.set(1.3, DESKTOP, 0.6); mouseObj.scale.setScalar(MS); mouseObj.rotation.y = -0.15; deskRig.add(mouseObj);
  var msb = box(0.7, 0.2, 1.0, mBeige); msb.position.y = 0.12; mouseObj.add(msb);

  // ---------- Blender models (public/models), swapped in over the fallback shapes once fetched
  function replaceKids(group, node, keepList) {
    if (!node) return;
    node.removeFromParent(); var q = node.quaternion.clone(); node.position.set(0, 0, 0);
    group.children.slice().forEach(function (c) { if (!keepList || keepList.indexOf(c) < 0) group.remove(c); });
    node.quaternion.copy(q); group.add(node);
  }
  function onModels(R) {
    var N = function (nm) { return R.getObjectByName(nm); };
    replaceKids(rack, N('Rack'));
    replaceKids(devPatch, N('PatchPanel'));
    replaceKids(devMgr, N('CableMgr'));
    replaceKids(devSw, N('Switch'), leds);
    replaceKids(devRt, N('Router'));
    replaceKids(devSv, N('Server'));
    replaceKids(desk, N('Desk'));
    replaceKids(keyboard, N('Keyboard'));
    replaceKids(mouseObj, N('Mouse'));
    var nMon = N('Monitor');
    if (nMon) {
      var scrMat = screen.material;
      replaceKids(monitor, nMon); monitor.add(scrGlow);
      var ns = nMon.getObjectByName('Screen');
      if (ns) { ns.material = scrMat; scrTex.flipY = false; scrTex.needsUpdate = true; screen = ns; lastMode = ''; }
    }
  }
  fetchModels(modelsUrl)
    .then(function (data) { if (alive) { onModels(buildGltf(T, data, keep, mBeige)); kick(); } })
    .catch(function (err) { console.warn('GavenNET: model load failed, keeping the fallback shapes', err); });

  // ---------- cables
  var VC = ['#B4F25A', '#5FD3FF', '#FF8A4C', '#C9A7FF'];
  function cableMat(hex) { return keep(new T.MeshStandardMaterial({ color: new T.Color(hex), roughness: 0.55, metalness: 0.05, emissive: new T.Color(hex), emissiveIntensity: 0.12 })); }
  function v(x, y, z) { return new T.Vector3(x, y, z); }
  function makeCable(pts, hex, r) {
    var curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
    var geo = keep(new T.TubeGeometry(curve, 64, r || 0.017, 6, false));
    var m = new T.Mesh(geo, cableMat(hex)); scene.add(m);
    return { curve: curve, mesh: m, count: geo.index.count, k: 0, color: hex };
  }
  var cables = [];
  for (var ci = 0; ci < 4; ci++) {
    var a = ppPort(ci), b = swPort(ci);
    var c = makeCable([a.clone().add(v(0, 0, 0.02)), a.clone().add(v(0, -0.03, 0.18)), v((a.x + b.x) / 2, Y.mgr, FRONT + 0.1), b.clone().add(v(0, 0.03, 0.18)), b.clone().add(v(0, 0, 0.02))], VC[ci]);
    c.a = 0.5 + ci * 0.02; c.b = c.a + 0.04; cables.push(c);
  }
  var s23 = swPort(23), r0 = rtPort(0);
  var trunk = makeCable([s23.clone().add(v(0, 0, 0.02)), s23.clone().add(v(0.04, -0.04, 0.22)), v(RX + 0.55, (Y.sw + Y.router) / 2, FRONT + 0.3), v(RX - 0.2, Y.router + 0.08, FRONT + 0.3), r0.clone().add(v(0, 0, 0.2)), r0.clone().add(v(0, 0, 0.02))], '#FFD24A', 0.02);
  trunk.a = 0.56; trunk.b = 0.6; cables.push(trunk);
  var s21 = swPort(21);
  var srvC = makeCable([svNic.clone().add(v(0, 0, 0.02)), svNic.clone().add(v(0, 0, 0.22)), v(RX + 1.0, Y.router - 0.2, FRONT + 0.26), v(RX + 0.35, Y.sw - 0.2, FRONT + 0.26), s21.clone().add(v(0, -0.02, 0.2)), s21.clone().add(v(0, 0, 0.02))], '#5FD3FF');
  srvC.a = 0.57; srvC.b = 0.6; cables.push(srvC);
  var con = makeCable([rtConsole.clone().add(v(0, 0, 0.02)), rtConsole.clone().add(v(0, -0.03, 0.25)), v(RX + 0.1, 0.9, FRONT + 0.4), v(RX - 0.7, 0.05, FRONT + 0.25), v(-0.25, 0.05, 0.4), v(-0.45, 0.05, -0.75), v(-0.45, 2.85, -0.85), v(-1.3, 3.05, -0.9), v(-2.0, 3.55, -1.25)], '#5FA8E8', 0.02);
  con.a = 0.7; con.b = 0.78; cables.push(con);

  // ---------- project plugs (one VLAN patch cable per project)
  var n = projects.length;
  var plugs = [];
  for (let pi = 0; pi < n; pi++) {
    var pg = new T.Group(); scene.add(pg); pg.visible = false;
    var boot = box(0.085, 0.075, 0.17, cableMat(projects[pi].color)); boot.position.z = 0.02; pg.add(boot);
    var tip = box(0.07, 0.055, 0.07, mClear); tip.position.z = -0.1; pg.add(tip);
    var pins = box(0.05, 0.01, 0.05, mGold); pins.position.set(0, 0.022, -0.1); pg.add(pins);
    var hit = new T.Mesh(keep(new T.SphereGeometry(0.2, 10, 8)), keep(new T.MeshBasicMaterial({ visible: false }))); pg.add(hit);
    var tt = keep(tagTexture(T, projects[pi]));
    var tag = new T.Mesh(keep(new T.PlaneGeometry(0.56, 0.175)), keep(new T.MeshBasicMaterial({ map: tt, transparent: true, side: T.DoubleSide, toneMapped: false })));
    scene.add(tag); tag.visible = false;
    [pg, boot, tip, hit, tag].forEach(function (o) { o.userData.idx = pi; });
    plugs.push({ g: pg, tag: tag, tagTex: tt, tagMat: tag.material, cable: null, last: new T.Vector3(1e9, 0, 0), spin: 0, k: 0 });
  }
  try { if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('40px VT323'), document.fonts.load('600 40px Geist')]).then(function () { if (!alive) return; lastMode = ''; plugs.forEach(function (pl, i) { var nt = tagTexture(T, projects[i]); pl.tagMat.map = nt; pl.tagMat.needsUpdate = true; pl.tagTex.dispose(); pl.tagTex = nt; disposables.push(nt); }); }); } } catch (e) {}

  function plugRest(i, t, lifted) {
    var bob = isStill() ? 0 : Math.sin(t * 1.3 + i) * 0.02;
    return v(RX - 0.75 + i * 0.5, 1.12 + (lifted ? 0.12 : 0) + bob, FRONT + 0.7 + (lifted ? 0.3 : 0));
  }
  function plugPort(i) { return swPort(12 + i).add(v(0, 0, 0.115)); }
  var tmpQ = new T.Quaternion(), qDown = new T.Quaternion().setFromEuler(new T.Euler(-Math.PI / 2, 0, 0)), qIn = new T.Quaternion();
  function rebuildPlugCable(pl, i) {
    var st = ppPort(12 + i);
    var backPt = pl.g.localToWorld(v(0, 0, 0.11)), backDir = pl.g.localToWorld(v(0, 0, 0.4)).sub(backPt).normalize();
    var p1 = st.clone().add(v(0, -0.03, 0.2)), p2 = backPt.clone().add(backDir.multiplyScalar(0.22));
    var mid = p1.clone().lerp(p2, 0.5); mid.y -= 0.25 * (1 - pl.k * 0.8); mid.z += 0.12;
    var curve = new T.CatmullRomCurve3([st.clone().add(v(0, 0, 0.02)), p1, mid, p2, backPt], false, 'centripetal');
    var geo = new T.TubeGeometry(curve, 48, 0.016, 6, false);
    if (!pl.cable) { pl.cable = { mesh: new T.Mesh(geo, cableMat(projects[i].color)), curve: curve }; scene.add(pl.cable.mesh); }
    else { pl.cable.mesh.geometry.dispose(); pl.cable.mesh.geometry = geo; pl.cable.curve = curve; }
  }

  // ---------- packets
  var pGeo = keep(new T.SphereGeometry(0.028, 10, 8));
  var packets = [];
  function addPackets(getCurve, hex, num, speed, isOn) {
    var m = keep(new T.MeshBasicMaterial({ color: new T.Color(hex), toneMapped: false }));
    for (var q = 0; q < num; q++) { var me = new T.Mesh(pGeo, m); me.visible = false; scene.add(me); packets.push({ mesh: me, getCurve: getCurve, t: q / num, speed: speed * (0.85 + Math.random() * 0.3), isOn: isOn }); }
  }
  cables.slice(0, 4).forEach(function (c) { addPackets(function () { return c.curve; }, c.color, 2, 0.25, function () { return c.k >= 1; }); });
  addPackets(function () { return trunk.curve; }, '#FFD24A', 3, 0.3, function () { return trunk.k >= 1; });
  addPackets(function () { return srvC.curve; }, '#5FD3FF', 2, 0.22, function () { return srvC.k >= 1; });
  addPackets(function () { return con.curve; }, '#9FD0FF', 4, 0.18, function () { return con.k >= 1 && (loaded >= 0 || (seq && seq.type === 'load')); });
  plugs.forEach(function (pl, i) {
    addPackets(function () { return pl.cable ? pl.cable.curve : null; }, projects[i].color, 4, 0.4, function () { return loaded === i || (seq && seq.idx === i && seq.type === 'load' && seqE > 0.8); });
  });

  // ---------- interaction state
  var selected = 0, loaded = -1, seq = null, seqE = 0, lastDraw = -1, lastMode = '';
  var mouse = new T.Vector2(0, 0), mouseS = new T.Vector2(0, 0), ndc = new T.Vector2(), ray = new T.Raycaster();
  var p = 0, pS = 0, lastStep = -1, lastPct = -1, finalReady = false, focusK = 0;
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
    if (loaded === selected) return;
    if (loaded >= 0) { plugs[loaded].k = 0; }
    seq = { type: 'load', idx: selected, t0: clock.getElapsedTime() };
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
  function pickables() { var arr = [screen]; plugs.forEach(function (pl) { arr.push(pl.g, pl.tag); }); return arr; }
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
    if (i === selected && loaded !== i) play(); else select(i);
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
  var camF = new T.Vector3(), lookF = new T.Vector3(), tmp = new T.Vector3();

  function frame() {
    raf = 0; if (!alive) return;
    var t = clock.getElapsedTime(), still = isStill();
    p = readProgress();
    pS += (p - pS) * (still ? 1 : 0.1);
    var P = pS;

    var step = P < 0.08 ? 0 : P < 0.2 ? 1 : P < 0.3 ? 2 : P < 0.4 ? 3 : P < 0.5 ? 4 : P < 0.6 ? 5 : P < 0.78 ? 6 : 7;
    var pct = Math.round(clamp(P / 0.78, 0, 1) * 100);
    if (step !== lastStep || pct !== lastPct) { lastStep = step; lastPct = pct; onState({ step: step, pct: pct }); }
    finalReady = P > 0.84;
    if (bg) bg.style.transform = 'translate(' + (-P * 55) + '%, -50%)';

    // rack devices slide in on their rails
    for (var i = 0; i < devices.length; i++) {
      var d = devices[i], k = sm(seg(P, d.a, d.b));
      d.o.visible = P > d.a - 0.005;
      d.o.position.set(RX, d.y, FRONT + (1 - k) * 2.6);
    }
    // cables draw themselves
    cables.forEach(function (c) {
      c.k = seg(P, c.a, c.b);
      c.mesh.visible = c.k > 0;
      c.mesh.geometry.setDrawRange(0, Math.floor(c.count * c.k / 6) * 6);
    });
    // desk + terminal slide in
    var kdk = back(seg(P, 0.6, 0.72));
    deskRig.visible = kdk > 0;
    deskRig.position.set(lerp(DESKX - 8, DESKX, kdk), 0, 0);

    // switch LEDs
    var ledTick = Math.floor(t * 8);
    for (var li = 0; li < 24; li++) {
      var on = false;
      if (li < 4) on = cables[li].k >= 1;
      else if (li === 21) on = srvC.k >= 1;
      else if (li === 23) on = trunk.k >= 1;
      else if (li >= 12 && li < 12 + n) on = (loaded === li - 12) || (seq && seq.idx === li - 12 && seq.type === 'load' && seqE > 0.8);
      var blink = on && !still && ((ledTick + li * 7) % 5 === 0);
      leds[li].material = on ? (blink ? ledOff : (li === 23 ? ledAmb : ledOn)) : ledOff;
    }

    // ---- plugs
    seqE = 0;
    if (seq) {
      seqE = (t - seq.t0) * (still ? 3 : 1);
      if (seq.type === 'load' && seqE > 2.4) { loaded = seq.idx; seq = null; notify(); }
      else if (seq && seq.type === 'eject' && seqE > 0.9) { seq = null; notify(); }
    }
    for (var j = 0; j < n; j++) {
      var pl = plugs[j], ke = back(seg(P, 0.78 + j * 0.02, 0.84 + j * 0.02));
      if (ke <= 0) { pl.g.visible = false; pl.tag.visible = false; if (pl.cable) pl.cable.mesh.visible = false; continue; }
      pl.g.visible = true; pl.tag.visible = true;
      var rest = plugRest(j, t, j === selected && loaded !== j), port = plugPort(j);
      var target, kin;
      if (seq && seq.idx === j) {
        var kk = seq.type === 'load' ? sm(clamp(seqE / 0.8, 0, 1)) : 1 - sm(clamp(seqE / 0.8, 0, 1));
        target = rest.clone().lerp(port, kk); target.z += Math.sin(kk * Math.PI) * 0.35; kin = kk;
      } else if (loaded === j) { target = port; kin = 1; }
      else { target = rest; kin = 0; target.y -= (1 - ke) * 3; }
      pl.k = kin;
      if (ke < 1 || seq) pl.g.position.copy(target); else pl.g.position.lerp(target, 0.2);
      qIn.identity(); tmpQ.copy(qDown).slerp(qIn, kin); pl.g.quaternion.copy(tmpQ);
      if (kin > 0.5) pl.tag.position.set(RX - 0.75 + j * 0.5, 0.42, FRONT + 0.5);
      else pl.tag.position.set(pl.g.position.x, pl.g.position.y - 0.21, pl.g.position.z + 0.06);
      pl.tag.scale.setScalar(j === selected ? 1.12 : 1);
      if (pl.g.position.distanceToSquared(pl.last) > 1e-7) { pl.g.updateWorldMatrix(true, false); rebuildPlugCable(pl, j); pl.last.copy(pl.g.position); }
      if (pl.cable) pl.cable.mesh.visible = true;
    }

    // packets
    packets.forEach(function (pk) {
      var cv = pk.getCurve(), on = cv && pk.isOn();
      pk.mesh.visible = !!on && !still;
      if (!pk.mesh.visible) return;
      pk.t = (pk.t + pk.speed * 0.016) % 1;
      pk.mesh.position.copy(cv.getPointAt(pk.t));
    });

    // camera
    var pp = seg(P, 0, 0.6), ang = lerp(0.45, -0.1, pp), rad = lerp(5.4, 4.6, pp);
    camA.set(RX + Math.sin(ang) * rad, lerp(3.2, 2.5, pp), FRONT + Math.cos(ang) * rad); lookA.set(RX, lerp(2.2, 1.7, pp), FRONT - 0.3);
    var wide = camera.aspect >= 1.3;
    camB.set(wide ? -0.45 : -0.2, 3.3, wide ? 9.2 : 14); lookB.set(wide ? -0.45 : -0.2, 2.2, 0);
    var kc = sm(seg(P, 0.6, 0.8));
    camP.copy(camA).lerp(camB, kc); lookP.copy(lookA).lerp(lookB, kc);
    // zoom toward the terminal while a project is up
    var wantFocus = (loaded >= 0 || (seq && seq.type === 'load' && seqE > 0.9)) && P > 0.84 ? 1 : 0;
    focusK += (wantFocus - focusK) * (still ? 1 : 0.06);
    screen.getWorldPosition(tmp);
    camF.set(tmp.x + 0.9, tmp.y + 0.35, tmp.z + 3.3); lookF.set(tmp.x + 0.25, tmp.y - 0.05, tmp.z);
    camP.lerp(camF, focusK * 0.85); lookP.lerp(lookF, focusK * 0.85);
    mouseS.lerp(mouse, 0.05);
    if (!still) { camP.x += mouseS.x * 0.4 * (1 - focusK * 0.7); camP.y += mouseS.y * 0.25 * (1 - focusK * 0.7); }
    camera.position.copy(camP); camera.lookAt(lookP);

    // screen
    var wantMode = seq && seq.type === 'load' && seqE > 0.8 ? 'boot' : (loaded >= 0 ? 'play' : (kdk > 0.98 && con.k >= 1 ? 'idle' : 'off'));
    var tick = wantMode === 'boot' ? Math.floor(t * 20) : Math.floor(t * 2);
    if (wantMode !== lastMode || tick !== lastDraw) {
      lastMode = wantMode; lastDraw = tick;
      drawScreen(scrCtx, wantMode, projects, wantMode === 'boot' ? seq.idx : loaded, t, seqE - 0.8);
      scrTex.needsUpdate = true;
    }
    scrGlow.intensity = wantMode === 'off' ? 0 : 2;

    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(frame);
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
      plugs.forEach(function (pl) { if (pl.cable) pl.cable.mesh.geometry.dispose(); });
      disposables.forEach(function (x) { try { x.dispose(); } catch (err) {} });
      renderer.dispose();
    }
  };
}
