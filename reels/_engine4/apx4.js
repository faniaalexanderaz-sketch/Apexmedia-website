/* Apex Engine 4 ("C4") — cinematic set engine.
   Every frame is a pure function of frame_number / fps. One frame = N accumulated sub-frames
   (true motion blur + lens depth of field + soft shadows + anti-aliasing from the same samples).
   The first half (math + camera rig) has no dependency on three.js so the smoothness check can run it in node. */
(function (root) {
  "use strict";
  /* ================= pure math + camera rig ================= */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const len = (a) => Math.hypot(a[0], a[1], a[2]), lerp = (a, b, k) => a + (b - a) * k, lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const c01 = (x) => Math.max(0, Math.min(1, x)), seg = (t, a, b) => c01((t - a) / (b - a));
  const smooth = (u) => u * u * u * (u * (6 * u - 15) + 10);
  const EASE = { linear: (u) => u, inout: smooth, drift: (u) => 0.6 * u + 0.4 * smooth(u), out: (u) => 1 - Math.pow(1 - u, 3), settle: (u) => 0.35 * u + 0.65 * (1 - Math.pow(1 - u, 3)) };
  function halton(i, b) { let f = 1, r = 0; i += 1; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* Catmull-Rom spline re-parametrised by arc length: at(s) moves at constant speed for linear s. */
  function path(P) {
    if (typeof P === "function") return { len: 0, at: P, fn: true };
    if (P.length === 1) return { len: 0, at: () => P[0] };
    const n = P.length - 1, raw = (u) => { const x = Math.min(n - 1e-9, Math.max(0, u * n)), i = Math.floor(x), f = x - i, p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)], o = [0, 0, 0];
      for (let k = 0; k < 3; k++) o[k] = 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * f * f * f); return o; };
    const N = 96 * n, pts = [raw(0)], cum = [0]; for (let i = 1; i <= N; i++) { pts.push(raw(i / N)); cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1]))); }
    const L = cum[N]; return { len: L, at(s) { const d = c01(s) * L; let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; } const w = cum[hi] - cum[lo]; return lerp3(pts[lo], pts[hi], w > 1e-9 ? (d - cum[lo]) / w : 0); } };
  }
  /* shots: [{t0,t1,trans:'cut'|'slide',cam:{eye:[pts]|fn(t),look:[pts]|fn(t),fov:[a,b]|a,ease,damp,aperture:[a,b]|a,focus:fn(t)|pt,breath}}] */
  function rig(shots) {
    const S = shots.map((s) => { const c = s.cam; return Object.assign({}, s, { _eye: path(c.eye), _look: path(c.look), _ease: typeof c.ease === "function" ? c.ease : EASE[c.ease || "drift"] }); });
    const shotIndex = (t) => { let i = 0; while (i < S.length - 1 && t >= S[i].t1 - 1e-7) i++; return i; };
    const lookRaw = (s, t) => (s._look.fn ? s._look.at(t) : s._look.at(s._ease(seg(t, s.t0, s.t1))));
    function cam(t) {
      const s = S[shotIndex(t)], c = s.cam, u = seg(t, s.t0, s.t1), k = s._ease(u);
      let eye = s._eye.fn ? s._eye.at(t) : s._eye.at(k);
      const b = c.breath === undefined ? 1 : c.breath; eye = add(eye, [Math.sin(t * 0.83) * 0.5 * b, Math.sin(t * 0.61 + 1.3) * 0.35 * b, Math.sin(t * 0.47 + 2.1) * 0.3 * b]);
      /* damped look target: weighted average of the target over the last `damp` seconds (never before the cut) */
      const tau = c.damp === undefined ? 0.4 : c.damp, M = 12; let look = [0, 0, 0], ws = 0;
      for (let i = 0; i <= M; i++) { const w = 1 - i / (M + 1), tt = s._look.fn ? t - (tau * i) / M : Math.max(s.t0, t - (tau * i) / M), p = lookRaw(s, tt); /* a followed subject already has a past before the cut */ look = add(look, mul(p, w)); ws += w; } look = mul(look, 1 / ws);
      const pick = (v) => (Array.isArray(v) ? lerp(v[0], v[1], k) : v), fov = pick(c.fov === undefined ? 32 : c.fov), ap = pick(c.aperture === undefined ? 1.2 : c.aperture);
      const fp = c.focus ? (typeof c.focus === "function" ? c.focus(t) : c.focus) : look;
      return { eye, look, fov, aperture: ap, focusDist: len(sub(fp, eye)), shot: s, u, k };
    }
    return { shots: S, shotIndex, cam };
  }
  /* Smoothness report used by the automatic gate: per-frame camera speed, spikes and stalls inside each shot. */
  function camReport(shots, fps) {
    const R = rig(shots), out = { ok: true, issues: [], shots: [] };
    R.shots.forEach((s, si) => {
      const f0 = Math.ceil(s.t0 * fps - 1e-6), f1 = Math.ceil(s.t1 * fps - 1e-6) - 1, sp = [], rot = []; let pe = null, pd = null;
      for (let f = f0; f <= f1; f++) { const c = R.cam(f / fps), d = sub(c.look, c.eye), dl = len(d), dn = mul(d, 1 / dl);
        if (pe) { sp.push(len(sub(c.eye, pe)) * fps); rot.push(Math.acos(Math.min(1, dn[0] * pd[0] + dn[1] * pd[1] + dn[2] * pd[2])) * fps); } pe = c.eye; pd = dn; }
      const mx = Math.max.apply(null, sp.concat([1e-6])), mr = Math.max.apply(null, rot.concat([1e-6])); let worst = 0, worstR = 0;
      for (let i = 1; i < sp.length; i++) { worst = Math.max(worst, Math.abs(sp[i] - sp[i - 1]) / Math.max(mx, 8)); worstR = Math.max(worstR, Math.abs(rot[i] - rot[i - 1]) / Math.max(mr, 0.02)); }
      const info = { shot: si, frames: f1 - f0 + 1, maxSpeed: +mx.toFixed(1), maxTurn: +mr.toFixed(3), speedStep: +worst.toFixed(3), turnStep: +worstR.toFixed(3) }; out.shots.push(info);
      if (worst > 0.1) { out.ok = false; out.issues.push("shot " + si + ": camera speed jumps " + (worst * 100).toFixed(0) + "% of peak in one frame"); }
      if (worstR > 0.12) { out.ok = false; out.issues.push("shot " + si + ": camera turn jumps " + (worstR * 100).toFixed(0) + "% of peak in one frame"); }
    });
    return out;
  }
  const C4 = { add, sub, mul, len, lerp, lerp3, c01, seg, smooth, EASE, halton, rng, path, rig, camReport, FPS: 60 };
  if (typeof module !== "undefined" && module.exports) module.exports = C4;
  root.C4 = C4;
  if (typeof THREE === "undefined") return;

  /* ================= renderer =================
     One scene pass per frame into a float target (colour + depth). A single post pass then does camera motion blur
     (velocity from depth re-projection with the previous camera), lens depth of field, ACES tone mapping and grading;
     a second small pass does FXAA. Nothing is accumulated over sub-frames. */
  const T = THREE, W = 1080, H = 1920; if (T.ColorManagement) T.ColorManagement.legacyMode = false; /* hex colours are sRGB, lighting is linear */
  const Q = (C4.quality = { scale: 0.75, post: true, shadows: true, fxaa: true, bloom: 0.6, grain: 0.045, shutter: 0.5, exposure: 1.0, preview: false, profile: false });
  let GW = W, GH = H, R3, GLC, scene, camera, pcam, RT, RT2, postScene, postCam, postMat, fxMat, quad, BL, bctx, GRAIN, out, octx, film, RIG, lights = {}, prevCache = {};
  const stat = (C4.stat = { scene: 0, post: 0, compose: 0, n: 0 });
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FS_POST = [
    "precision highp float; varying vec2 vUv; uniform sampler2D tC; uniform sampler2D tD; uniform mat4 uInvVP; uniform mat4 uPrevVP; uniform vec2 uRes; uniform float uNear, uFar, uFocus, uCocK, uBlur, uExp, uCon, uSat, uSeed;",
    "float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }",
    "vec3 fit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }",
    "vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777)); const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); c *= uExp / 0.6; return clamp(O * fit(I * c), 0.0, 1.0); }",
    "void main(){ float d = texture2D(tD, vUv).x; vec4 wp = uInvVP * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); wp /= wp.w; vec4 pp = uPrevVP * wp; vec2 vel = (vUv - (pp.xy / pp.w * 0.5 + 0.5)) * uBlur; float vl = length(vel * uRes); if (vl > 40.0) vel *= 40.0 / vl;",
    "  float z = lin(d); float coc = min(uCocK * abs(z - uFocus) / z, 22.0); float ph = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) + uSeed)) * 6.2831853; vec3 acc = vec3(0.0); float ws = 0.0;",
    "  for (int i = 0; i < 12; i++) { float fi = (float(i) + 0.5) / 12.0; float a = ph + float(i) * 2.3999632; vec2 o = vec2(cos(a), sin(a)) * sqrt(fi) * max(coc, 0.35) / uRes + vel * (fi - 0.5); vec2 uv = vUv + o; float zs = lin(texture2D(tD, uv).x); float cs = min(uCocK * abs(zs - uFocus) / zs, 22.0);",
    "    float w = (zs < z - 12.0 && cs < coc * 0.5) ? 0.15 : 1.0; acc += texture2D(tC, uv).rgb * w; ws += w; }",
    "  vec3 c = aces(acc / ws); c = mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); c = (c - 0.5) * uCon + 0.5; float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, uSat); gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0); }"].join("\n");
  const FS_FXAA = [
    "precision highp float; varying vec2 vUv; uniform sampler2D tC; uniform vec2 uRes;",
    "void main(){ vec2 px = 1.0 / uRes; vec3 nw = texture2D(tC, vUv + vec2(-1.0, -1.0) * px).rgb, ne = texture2D(tC, vUv + vec2(1.0, -1.0) * px).rgb, sw = texture2D(tC, vUv + vec2(-1.0, 1.0) * px).rgb, se = texture2D(tC, vUv + vec2(1.0, 1.0) * px).rgb, m = texture2D(tC, vUv).rgb; const vec3 L = vec3(0.299, 0.587, 0.114);",
    "  float lnw = dot(nw, L), lne = dot(ne, L), lsw = dot(sw, L), lse = dot(se, L), lm = dot(m, L), lmin = min(lm, min(min(lnw, lne), min(lsw, lse))), lmax = max(lm, max(max(lnw, lne), max(lsw, lse)));",
    "  vec2 dir = vec2(-((lnw + lne) - (lsw + lse)), (lnw + lsw) - (lne + lse)); float red = max((lnw + lne + lsw + lse) * 0.03125, 0.0078125); float rc = 1.0 / (min(abs(dir.x), abs(dir.y)) + red); dir = clamp(dir * rc, vec2(-8.0), vec2(8.0)) * px;",
    "  vec3 a = 0.5 * (texture2D(tC, vUv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(tC, vUv + dir * (2.0 / 3.0 - 0.5)).rgb); vec3 b = a * 0.5 + 0.25 * (texture2D(tC, vUv + dir * -0.5).rgb + texture2D(tC, vUv + dir * 0.5).rgb); float lb = dot(b, L); gl_FragColor = vec4((lb < lmin || lb > lmax) ? a : b, 1.0); }"].join("\n");
  function init(canvas, f) {
    film = f; out = canvas; octx = out.getContext("2d"); if (Q.preview) Object.assign(Q, { scale: 0.5, post: false, shadows: false, bloom: 0, grain: 0 });
    GW = Math.round(W * Q.scale); GH = Math.round(H * Q.scale); GLC = document.createElement("canvas"); GLC.width = GW; GLC.height = GH;
    R3 = new T.WebGLRenderer({ canvas: GLC, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    R3.setPixelRatio(1); R3.setSize(GW, GH, false); R3.outputEncoding = T.sRGBEncoding; R3.toneMapping = T.ACESFilmicToneMapping; R3.toneMappingExposure = Q.exposure; R3.shadowMap.enabled = Q.shadows; R3.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene(); camera = new T.PerspectiveCamera(32, W / H, 8, 6000); pcam = new T.PerspectiveCamera(32, W / H, 8, 6000);
    const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }; BL = mk(W / 8, H / 8); bctx = BL.getContext("2d");
    GRAIN = mk(256, 256); { const g = GRAIN.getContext("2d"), im = g.createImageData(256, 256), r = rng(77); for (let i = 0; i < 65536; i++) { const v = 96 + r() * 64; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }
    if (Q.post) { RT = new T.WebGLRenderTarget(GW, GH, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthTexture: new T.DepthTexture(GW, GH) }); RT2 = new T.WebGLRenderTarget(GW, GH, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
      postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); postScene = new T.Scene(); const U = (v) => ({ value: v });
      postMat = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_POST, depthTest: false, depthWrite: false, toneMapped: false, uniforms: { tC: U(RT.texture), tD: U(RT.depthTexture), uInvVP: U(new T.Matrix4()), uPrevVP: U(new T.Matrix4()), uRes: U(new T.Vector2(GW, GH)), uNear: U(8), uFar: U(6000), uFocus: U(300), uCocK: U(0), uBlur: U(1), uExp: U(Q.exposure), uCon: U(1.06), uSat: U(1.08), uSeed: U(0) } });
      fxMat = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_FXAA, depthTest: false, depthWrite: false, toneMapped: false, uniforms: { tC: U(RT2.texture), uRes: U(new T.Vector2(GW, GH)) } }); quad = new T.Mesh(new T.PlaneGeometry(2, 2), postMat); quad.frustumCulled = false; postScene.add(quad); }
    /* image-based light for believable reflections: a tiny studio of warm and cool panels, used only by glossy materials */
    const pm = new T.PMREMGenerator(R3), es = new T.Scene(); es.background = new T.Color(film.envBg || "#0c0a09");
    (film.envPanels || [["#ffc890", [6, 5, 2], 5], ["#8fb4ff", [-7, 4, -3], 4], ["#ffe6c8", [0, 8, 0], 6], ["#ff9a5c", [2, 1, -7], 3]]).forEach((p) => { const m = new T.Mesh(new T.SphereGeometry(p[2] * 0.5, 16, 12), new T.MeshBasicMaterial({ color: p[0] })); m.position.set(p[1][0], p[1][1], p[1][2]); es.add(m); });
    C4.ENV = pm.fromScene(es, 0.04).texture;
    RIG = rig(film.shots); C4.scene = scene; C4.camera = camera; C4.R3 = R3; C4.RIG = RIG; film.build(scene);
  }
  function aim(cam, c) { cam.position.set(c.eye[0], c.eye[1], c.eye[2]); cam.up.set(0, 1, 0); cam.lookAt(c.look[0], c.look[1], c.look[2]); cam.fov = c.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); }
  const sync = () => { if (Q.profile) R3.getContext().finish(); };
  function drawGL(t, frame) {
    const c = RIG.cam(t), s = c.shot, t0 = performance.now(); (s.update || film.update)(t, c, s); aim(camera, c);
    if (!Q.post) { R3.setRenderTarget(null); R3.render(scene, camera); sync(); stat.scene += performance.now() - t0; return; }
    R3.setRenderTarget(RT); R3.render(scene, camera); sync(); const t1 = performance.now(); stat.scene += t1 - t0;
    aim(pcam, RIG.cam(Math.max(s.t0, t - Q.shutter / C4.FPS))); const u = postMat.uniforms, g = s.grade || film.grade || {};
    u.uInvVP.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert(); u.uPrevVP.value.multiplyMatrices(pcam.projectionMatrix, pcam.matrixWorldInverse);
    u.uFocus.value = c.focusDist; u.uCocK.value = (c.aperture * GH) / (2 * Math.tan((c.fov * Math.PI) / 360)) / c.focusDist; u.uCon.value = g.contrast || 1.06; u.uSat.value = g.sat || 1.08; u.uSeed.value = halton(frame, 2);
    quad.material = postMat; R3.setRenderTarget(Q.fxaa ? RT2 : null); R3.render(postScene, postCam); if (Q.fxaa) { quad.material = fxMat; R3.setRenderTarget(null); R3.render(postScene, postCam); } sync(); stat.post += performance.now() - t1;
  }
  function render(t) {
    const frame = Math.round(t * C4.FPS); t = Math.min(film.D - 1e-4, Math.max(0, frame / C4.FPS)); const i = RIG.shotIndex(t), s = RIG.shots[i], g = s.grade || film.grade || {}, TR = 0.42, sliding = s.trans === "slide" && i > 0 && t - s.t0 < TR;
    if (sliding && !prevCache[i]) { const c = document.createElement("canvas"); c.width = W; c.height = H; drawGL(RIG.shots[i - 1].t1 - 1 / C4.FPS, frame); c.getContext("2d").drawImage(GLC, 0, 0, W, H); prevCache[i] = c; }
    drawGL(t, frame); const t0 = performance.now(), SC = out.width / W; octx.setTransform(SC, 0, 0, SC, 0, 0); /* the output canvas may be smaller than 1080x1920 (preview) */ octx.globalCompositeOperation = "source-over"; octx.globalAlpha = 1; octx.filter = "none"; octx.imageSmoothingQuality = "high";
    if (sliding) { /* lateral slide between shots, smeared along its own motion */ const off = (u) => (1 - smooth(seg(u, s.t0, s.t0 + TR))) * W, o1 = off(t), o0 = off(t - Q.shutter / C4.FPS), K = 6; for (let k = 0; k < K; k++) { const o = lerp(o0, o1, (k + 0.5) / K); octx.globalAlpha = 1 / (k + 1); octx.drawImage(prevCache[i], o - W, 0); octx.drawImage(GLC, o, 0, W, H); } octx.globalAlpha = 1; } else octx.drawImage(GLC, 0, 0, W, H);
    if (Q.bloom > 0) { bctx.filter = "brightness(0.6) contrast(4.5) blur(3px)"; bctx.drawImage(out, 0, 0, W / 8, H / 8); bctx.filter = "none"; octx.globalCompositeOperation = "lighter"; octx.globalAlpha = Q.bloom * 0.6; octx.drawImage(BL, 0, 0, W, H); octx.globalAlpha = 1; octx.globalCompositeOperation = "source-over"; }
    const vg = octx.createRadialGradient(W / 2, H * 0.48, 420, W / 2, H * 0.48, 1250); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + (g.vignette === undefined ? 0.5 : g.vignette) + ")"); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
    if (film.overlay) film.overlay(octx, t, s);
    if (Q.grain > 0) { octx.globalCompositeOperation = "overlay"; octx.globalAlpha = Q.grain * 4; const gx = Math.floor(halton(frame, 2) * 256), gy = Math.floor(halton(frame, 3) * 256); for (let y = -gy; y < H; y += 256) for (let x = -gx; x < W; x += 256) octx.drawImage(GRAIN, x, y); octx.globalAlpha = 1; octx.globalCompositeOperation = "source-over"; }
    stat.compose += performance.now() - t0; stat.n++;
  }
  Object.assign(C4, { init, render, W, H });

  /* ================= procedural PBR textures ================= */
  function cnv(s, draw) { const c = document.createElement("canvas"); c.width = c.height = s; draw(c.getContext("2d"), s); return c; }
  function noiseFn(seed, n) { const r = rng(seed), g = []; for (let i = 0; i < n * n; i++) g.push(r()); return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = g[(((yi % n) + n) % n) * n + (((xi % n) + n) % n)], b = g[(((yi % n) + n) % n) * n + ((((xi + 1) % n) + n) % n)], c = g[((((yi + 1) % n) + n) % n) * n + (((xi % n) + n) % n)], d = g[((((yi + 1) % n) + n) % n) * n + ((((xi + 1) % n) + n) % n)]; return lerp(lerp(a, b, sx), lerp(c, d, sx), sy); }; }
  function fbmCanvas(s, seed, oct, base, amp) { return cnv(s, (g) => { const n = noiseFn(seed, 64), im = g.createImageData(s, s); for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { let v = 0, a = 0.5, f = 8 / s; for (let o = 0; o < oct; o++) { v += n(x * f, y * f) * a; a *= 0.5; f *= 2; } const q = Math.max(0, Math.min(255, base + (v - 0.5) * amp)); im.data[(y * s + x) * 4] = im.data[(y * s + x) * 4 + 1] = im.data[(y * s + x) * 4 + 2] = q; im.data[(y * s + x) * 4 + 3] = 255; } g.putImageData(im, 0, 0); }); }
  function normalFrom(hc, strength) { const s = hc.width, src = hc.getContext("2d").getImageData(0, 0, s, s).data; return cnv(s, (g) => { const im = g.createImageData(s, s), hgt = (x, y) => src[((((y + s) % s) * s + ((x + s) % s)) * 4)] / 255; for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const dx = (hgt(x + 1, y) - hgt(x - 1, y)) * strength, dy = (hgt(x, y + 1) - hgt(x, y - 1)) * strength, l = Math.hypot(dx, dy, 1), i = (y * s + x) * 4; im.data[i] = (-dx / l * 0.5 + 0.5) * 255; im.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; im.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }); }
  function tx(c, rx, ry, srgb) { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.anisotropy = 8; if (srgb) t.encoding = T.sRGBEncoding; return t; }
  const shade = (hex, k) => { const c = new T.Color(hex); c.offsetHSL(0, 0, k); return "#" + c.getHexString(); };
  const TEXC = {};
  function texSet(name, s, drawColor, drawHeight, nStrength) { if (!TEXC[name]) { const col = cnv(s, drawColor), hc = cnv(s, drawHeight); TEXC[name] = { col, hc, nrm: normalFrom(hc, nStrength || 3) }; } return TEXC[name]; }
  const MAT = (C4.MAT = {
    brick(rx, ry, base) { base = base || "#6f3524"; const r0 = rng(11), B = [];
      for (let row = 0; row < 8; row++) for (let i = -1; i < 4; i++) B.push([i * 128 + (row % 2) * 64 + 4, row * 64 + 4, 120, 56, r0(), r0()]);
      const S = texSet("brick" + base, 512, (g, s) => { g.fillStyle = "#6e675d"; g.fillRect(0, 0, s, s); const n = rng(5); for (let i = 0; i < 5000; i++) { g.fillStyle = "rgba(60,52,44," + n() * 0.25 + ")"; g.fillRect(n() * s, n() * s, 2, 2); }
        B.forEach((b) => { g.fillStyle = shade(base, (b[4] - 0.5) * 0.07); g.fillRect(b[0], b[1], b[2], b[3]); for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(" + (n() > 0.5 ? "255,220,190," : "30,12,8,") + n() * 0.16 + ")"; g.fillRect(b[0] + n() * b[2], b[1] + n() * b[3], 1 + n() * 5, 1 + n() * 3); } if (b[5] > 0.9) { g.fillStyle = "rgba(20,10,8,0.14)"; g.fillRect(b[0], b[1], b[2], b[3]); } });
      }, (g, s) => { g.fillStyle = "#3a3a3a"; g.fillRect(0, 0, s, s); const n = rng(9); B.forEach((b) => { g.fillStyle = "#d0d0d0"; g.fillRect(b[0], b[1], b[2], b[3]); g.fillStyle = "#b4b4b4"; g.fillRect(b[0], b[1], b[2], 3); g.fillRect(b[0], b[1] + b[3] - 3, b[2], 3); for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(0,0,0," + n() * 0.35 + ")"; g.beginPath(); g.arc(b[0] + n() * b[2], b[1] + n() * b[3], 0.6 + n() * 1.8, 0, 6.3); g.fill(); } }); }, 5);
      return new T.MeshLambertMaterial({ map: tx(S.col, rx, ry, true), normalMap: tx(S.nrm, rx, ry), normalScale: new T.Vector2(1.6, 1.6) }); },
    wood(rx, ry, base, gloss) { base = base || "#6b4226"; const S = texSet("wood" + base, 512, (g, s) => { const n = rng(21); for (let p = 0; p < 6; p++) { const x0 = (p * s) / 6; g.fillStyle = shade(base, (n() - 0.5) * 0.045); g.fillRect(x0, 0, s / 6, s); for (let i = 0; i < 70; i++) { const x = x0 + n() * (s / 6), a = n() * 0.22; g.strokeStyle = "rgba(" + (n() > 0.35 ? "30,14,6," : "255,210,160,") + a * 0.55 + ")"; g.lineWidth = 0.6 + n() * 1.6; g.beginPath(); const w = n() * 6; g.moveTo(x, 0); for (let y = 0; y <= s; y += 32) g.lineTo(x + Math.sin(y * 0.02 + i) * w, y); g.stroke(); } if (n() > 0.4) { const kx = x0 + 20 + n() * 40, ky = n() * s; g.strokeStyle = "rgba(25,10,4,0.4)"; for (let r = 3; r < 14; r += 3) { g.beginPath(); g.ellipse(kx, ky, r * 0.7, r * 1.6, 0, 0, 6.3); g.stroke(); } } g.fillStyle = "rgba(10,5,2,0.8)"; g.fillRect(x0, 0, 2, s); const jy = n() * s; g.fillRect(x0, jy, s / 6, 2); } },
      (g, s) => { g.fillStyle = "#bdbdbd"; g.fillRect(0, 0, s, s); const n = rng(21); for (let p = 0; p < 6; p++) { const x0 = (p * s) / 6; n(); for (let i = 0; i < 70; i++) { const x = x0 + n() * (s / 6); n(); n(); g.strokeStyle = "rgba(0,0,0," + n() * 0.12 + ")"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke(); n(); } g.fillStyle = "#222"; g.fillRect(x0, 0, 3, s); } const m = rng(4); for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(255,255,255," + m() * 0.2 + ")"; g.fillRect(m() * s, m() * s, 1 + m() * 14, 1); } }, 2.2);
      return gloss ? new T.MeshStandardMaterial({ map: tx(S.col, rx, ry, true), normalMap: tx(S.nrm, rx, ry), roughnessMap: tx(S.hc, rx, ry), roughness: 0.55, metalness: 0, envMapIntensity: 0.9, envMap: C4.ENV }) : new T.MeshLambertMaterial({ map: tx(S.col, rx, ry, true), normalMap: tx(S.nrm, rx, ry) }); },
    cloth(color, rx, ry, rough) { const S = texSet("cloth", 256, (g, s) => { g.fillStyle = "#fff"; g.fillRect(0, 0, s, s); const n = rng(3); for (let y = 0; y < s; y += 4) for (let x = 0; x < s; x += 4) { g.fillStyle = "rgba(0,0,0," + (((x + y) / 4) % 2 ? 0.07 : 0.0) + ")"; g.fillRect(x, y, 4, 4); if (n() > 0.9) { g.fillStyle = "rgba(0,0,0,0.05)"; g.fillRect(x, y, 4, 4); } } },
      (g, s) => { g.fillStyle = "#808080"; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 4) for (let x = 0; x < s; x += 4) { g.fillStyle = ((x + y) / 4) % 2 ? "#a8a8a8" : "#5c5c5c"; g.fillRect(x, y, 3, 3); } const n = rng(8); for (let i = 0; i < 9; i++) { const gr = g.createLinearGradient(0, n() * s, s, n() * s); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.strokeStyle = gr; g.lineWidth = 10 + n() * 22; g.beginPath(); const y0 = n() * s; g.moveTo(0, y0); g.bezierCurveTo(s * 0.3, y0 + (n() - 0.5) * 120, s * 0.7, y0 + (n() - 0.5) * 120, s, y0 + (n() - 0.5) * 60); g.stroke(); } }, 2.4);
      return new T.MeshLambertMaterial({ color, map: tx(S.col, rx || 3, ry || 3, true), normalMap: tx(S.nrm, rx || 3, ry || 3), normalScale: new T.Vector2(0.6, 0.6) }); },
    plaster(color, rx, ry) { if (!TEXC.plaster) { const h = fbmCanvas(256, 31, 5, 128, 150); TEXC.plaster = { hc: h, nrm: normalFrom(h, 2.2), col: fbmCanvas(256, 47, 4, 225, 50) }; } const S = TEXC.plaster; return new T.MeshLambertMaterial({ color, map: tx(S.col, rx || 2, ry || 2, true), normalMap: tx(S.nrm, rx || 2, ry || 2) }); },
    skin(color) { if (!TEXC.skin) { const h = fbmCanvas(128, 61, 4, 128, 40); TEXC.skin = { nrm: normalFrom(h, 0.6) }; } return new T.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, normalMap: tx(TEXC.skin.nrm, 3, 3), normalScale: new T.Vector2(0.25, 0.25), envMapIntensity: 0.45 }); },
    paint(color, rough, metal) { if (!TEXC.scr) { const h = cnv(256, (g, s) => { g.fillStyle = "#808080"; g.fillRect(0, 0, s, s); const n = rng(71); for (let i = 0; i < 260; i++) { g.strokeStyle = "rgba(" + (n() > 0.5 ? "255,255,255," : "0,0,0,") + n() * 0.35 + ")"; g.lineWidth = 0.5 + n(); g.beginPath(); const x = n() * s, y = n() * s, a = n() * 6.3, l = 4 + n() * 40; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }); TEXC.scr = { hc: h, nrm: normalFrom(h, 0.9), ro: fbmCanvas(256, 83, 4, 150, 120) }; } const S = TEXC.scr; return new T.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.5 : rough, metalness: metal || 0, roughnessMap: tx(S.ro, 2, 2), normalMap: tx(S.nrm, 2, 2), normalScale: new T.Vector2(0.35, 0.35), envMapIntensity: metal ? 1.2 : 0.7, envMap: (metal || (rough !== undefined && rough < 0.4)) ? C4.ENV : null }); },
    glass(color, op) { return new T.MeshStandardMaterial({ color: color || "#ffffff", roughness: 0.04, metalness: 0, transparent: true, opacity: op === undefined ? 0.28 : op, envMapIntensity: 2.2, envMap: C4.ENV, depthWrite: false, side: T.DoubleSide }); },
    glow(color, k) { const c = new T.Color(color); c.multiplyScalar(k || 1); return new T.MeshBasicMaterial({ color: c, toneMapped: true, fog: false }); },
  });

  Object.keys(MAT).forEach((k) => { const f = MAT[k], memo = {}; MAT[k] = function () { const key = Array.prototype.join.call(arguments, "|"); return memo[key] || (memo[key] = f.apply(MAT, arguments)); }; });
  /* ================= geometry helpers ================= */
  const GEO = {};
  function rboxGeo(w, h, d, r) { const key = [w, h, d, r].join("_"); if (GEO[key]) return GEO[key]; r = Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01); const g = new T.BoxGeometry(w, h, d, 4, 4, 4), p = g.attributes.position, n = g.attributes.normal, v = new T.Vector3(), q = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); q.set(Math.max(-w / 2 + r, Math.min(w / 2 - r, v.x)), Math.max(-h / 2 + r, Math.min(h / 2 - r, v.y)), Math.max(-d / 2 + r, Math.min(d / 2 - r, v.z))); const o = v.clone().sub(q); if (o.lengthSq() > 1e-10) { o.normalize(); p.setXYZ(i, q.x + o.x * r, q.y + o.y * r, q.z + o.z * r); n.setXYZ(i, o.x, o.y, o.z); } } return (GEO[key] = g); }
  function mesh(geo, mat, p, o) { const m = new T.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); o = o || {}; if (o.r) m.rotation.set(o.r[0], o.r[1], o.r[2]); if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]); m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false; return m; }
  const rbox = (w, h, d, r, mat, p, o) => mesh(rboxGeo(w, h, d, r), mat, p, o);
  const cyl = (rt, rb, h, mat, p, o) => mesh(new T.CylinderGeometry(rt, rb, h, 28, 1), mat, p, o);
  const sph = (r, mat, p, o) => mesh(new T.SphereGeometry(r, r > 8 ? 36 : 18, r > 8 ? 24 : 12), mat, p, o);
  const cap = (r, l, mat, p, o) => mesh(new T.CapsuleGeometry(r, l, 5, r > 3 ? 18 : 10), mat, p, o);
  const lathe = (pts, mat, p, o) => mesh(new T.LatheGeometry(pts.map((q) => new T.Vector2(q[0], q[1])), (o && o.seg) || 32), mat, p, o);
  const grp = (p, kids) => { const g = new T.Group(); if (p) g.position.set(p[0], p[1], p[2]); (kids || []).forEach((k) => g.add(k)); return g; };
  Object.assign(C4, { rbox, cyl, sph, cap, lathe, grp, mesh, tx, cnv });

  /* ================= characters ================= */
  const SKIN = ["#f2c9a5", "#e0a880", "#c98d62", "#8d5a3b", "#f6d6ba"];
  function limb(l, r, mat) { return cap(r, Math.max(0.1, l - r * 0.6), mat, [0, -l / 2, 0]); }
  function hand(side, skinM, lod) { const g = grp([0, 0, 0]); if (lod) { g.add(rbox(7.4, 13.5, 3.6, 1.7, skinM, [0, -6.6, 0])); g.userData.fingers = []; return g; } g.add(rbox(7.2, 8.4, 3.2, 1.5, skinM, [0, -4.4, 0])); const F = []; for (let i = 0; i < 4; i++) { const f = grp([-2.7 + i * 1.8, -8.2, 0]); f.add(cap(0.95, 3.2 - Math.abs(i - 1.5) * 0.5, skinM, [0, -2, 0])); const f2 = grp([0, -4, 0]); f2.add(cap(0.85, 2.2, skinM, [0, -1.5, 0])); f.add(f2); f.userData.tip = f2; g.add(f); F.push(f); } const th = grp([side * 3.6, -3.2, 1]); th.add(cap(1.05, 3.2, skinM, [0, -2, 0])); th.rotation.set(-0.3, 0, side * 0.75); g.add(th); g.userData.fingers = F; return g; }
  function character(o) {
    o = o || {}; const skinM = MAT.skin(o.skin || SKIN[0]), topM = MAT.cloth(o.top || "#f1efe9", 7, 7), botM = MAT.cloth(o.bottom || "#23262e", 7, 7), shoeM = MAT.paint(o.shoe || "#141414", 0.45), hairM = new T.MeshStandardMaterial({ color: o.hair || "#3a2416", roughness: 0.55, metalness: 0, envMapIntensity: 0.6 });
    const g = grp([0, 0, 0]), hips = grp([0, 84, 0]), spine = grp([0, 0, 0]); g.add(hips); hips.add(spine);
    hips.add(sph(13.6, botM, [0, 0, 0], { s: [1, 0.72, 0.8] }));
    spine.add(lathe([[0, -9], [13.2, -7], [14.2, 4], [12.8, 18], [14.6, 34], [15.6, 44], [11.5, 50], [5.2, 54], [0, 54]], topM, [0, 0, 0], { s: [1, 1, 0.76] }));
    spine.add(cyl(4.3, 4.8, 9, skinM, [0, 56, 0])); spine.add(mesh(new T.TorusGeometry(5.6, 1.5, 10, 24), topM, [0, 52.5, 0.4], { r: [Math.PI / 2, 0, 0] }));
    const head = grp([0, 72, 0]); spine.add(head); head.add(sph(15.5, skinM, [0, 0, 0], { s: [1, 1.07, 1.02] })); head.add(sph(2.5, skinM, [0, -2.2, 15.2], { s: [1, 0.9, 1] })); [-1, 1].forEach((s) => head.add(sph(3.4, skinM, [s * 15.2, -1, -1], { s: [0.45, 1, 0.8] })));
    const eyeW = new T.MeshStandardMaterial({ color: "#fbfaf7", roughness: 0.2, envMapIntensity: 1, envMap: C4.ENV }), iris = new T.MeshStandardMaterial({ color: o.eye || "#3b2a1c", roughness: 0.15, envMapIntensity: 1.4, envMap: C4.ENV }), dark = new T.MeshStandardMaterial({ color: "#3a1512", roughness: 0.6 });
    const eyes = [], lids = [], brows = []; [-1, 1].forEach((s) => { const e = grp([s * 5.7, 1.6, 12.6]); e.add(sph(3.2, eyeW, [0, 0, 0], { cast: false })); const ir = grp([0, 0, 0]); ir.add(sph(1.9, iris, [0, 0, 2.72], { s: [1, 1, 0.34], cast: false })); ir.add(sph(1.0, new T.MeshStandardMaterial({ color: "#050505", roughness: 0.1 }), [0, 0, 3.12], { s: [1, 1, 0.3], cast: false })); ir.add(sph(0.42, MAT.glow("#ffffff", 1.6), [0.75, 0.85, 3.34], { cast: false })); e.add(ir); const lid = mesh(new T.SphereGeometry(3.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), skinM, [0, 0, 0], { cast: false }); lid.rotation.x = -1.2; e.add(lid); head.add(e); eyes.push(ir); lids.push(lid);
      const b = cap(0.75, 4.4, hairM, [s * 5.9, 7.3, 14.1], { r: [0, 0, Math.PI / 2], cast: false }); head.add(b); brows.push(b); });
    const smile = mesh(new T.TorusGeometry(3.6, 0.55, 8, 20, Math.PI), dark, [0, -6.1, 14.0], { r: [0.15, 0, Math.PI], cast: false }); head.add(smile); const mouth = sph(1, dark, [0, -7.2, 14.1], { s: [2.6, 0.2, 0.9], cast: false }); head.add(mouth);
    /* hair with volume: cap + lumps, on its own group so it can lag behind the head */
    const hair = grp([0, 0, 0]); head.add(hair); const hs = o.hairStyle || "short";
    if (hs !== "bald") { hair.add(mesh(new T.SphereGeometry(17.5, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.47), hairM, [0, 1.2, -1.4], { r: [-0.5, 0, 0] })); const r = rng(o.seed || 1); for (let i = 0; i < 7; i++) { const a = -1.15 + (i / 6) * 2.3; hair.add(sph(5.2 + r() * 1.2, hairM, [Math.sin(a) * 11.6, 13.6 + r() * 1.2 - Math.abs(a) * 1.6, 5.2 + Math.cos(a) * 4.4], { s: [1.25, 0.62, 1.05], r: [0.5, 0, -a * 0.5] })); } }
    if (hs === "long") { hair.add(lathe([[13, 6], [16.6, -2], [17, -14], [15, -26], [11, -34], [0, -36]], hairM, [0, 0, -4.5], { s: [1, 1, 0.72] })); }
    if (hs === "bun") hair.add(sph(7, hairM, [0, 15, -9]));
    let hat = null; if (o.hat === "chef") { hat = grp([0, 13, 0]); hat.add(cyl(13.2, 13.6, 9, MAT.cloth("#f7f5f0", 2, 1), [0, 4, 0])); hat.add(sph(16.5, MAT.cloth("#f7f5f0", 2, 2), [0, 17, 0], { s: [1, 0.72, 1] })); for (let i = 0; i < 7; i++) hat.add(sph(6.2, MAT.cloth("#f7f5f0", 1, 1), [Math.cos(i * 0.9) * 10.5, 15, Math.sin(i * 0.9) * 10.5])); head.add(hat); }
    const arms = [], legs = []; [-1, 1].forEach((s) => { const sh = grp([s * 17.6, 45, 0]); spine.add(sh); sh.add(sph(5.6, topM, [0, 0, 0])); sh.add(limb(25, 4.9, topM)); const el = grp([0, -25, 0]); sh.add(el); el.add(limb(22, o.sleeves === "short" ? 3.8 : 4.3, o.sleeves === "short" ? skinM : topM)); if (o.sleeves !== "short") el.add(cyl(4.7, 4.7, 3, topM, [0, -20.5, 0])); const hd = grp([0, -22.5, 0]); hd.add(hand(s, skinM, o.lod)); el.add(hd); arms.push({ sh, el, hd, fingers: hd.children[0].userData.fingers });
      const hp = grp([s * 7.6, -2, 0]); hips.add(hp); hp.add(limb(40, 6.7, botM)); const kn = grp([0, -40, 0]); hp.add(kn); kn.add(limb(37, 5.3, botM)); const ft = grp([0, -37, 0]); ft.add(rbox(9.4, 6.4, 22, 2.8, shoeM, [0, -2, 4.5])); kn.add(ft); legs.push({ hp, kn, ft }); });
    let apron = null; if (o.apron) { apron = grp([0, 30, 0]); const am = MAT.cloth(o.apron, 2, 3); apron.add(rbox(22, 46, 1.6, 0.7, am, [0, -23, 11.6])); apron.add(rbox(24, 3, 24, 1.2, am, [0, -3, 0])); spine.add(apron); }
    if (o.buttons) for (let i = 0; i < 4; i++) [-1, 1].forEach((s) => spine.add(sph(1.1, MAT.paint(o.buttons, 0.3, 0.2), [s * 3.6, 12 + i * 8.5, 11.2 - (i > 2 ? 0.6 : 0)])));
    if (o.bow) { const bm = MAT.cloth(o.bow, 1, 1); [-1, 1].forEach((s) => spine.add(rbox(4.6, 3.6, 1.6, 0.7, bm, [s * 2.9, 50, 11.2], { r: [0, 0, s * 0.25] }))); spine.add(sph(1.3, bm, [0, 50, 11.8])); }
    g.traverse((m) => { if (m.isMesh) { m.frustumCulled = false; if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); const sc2 = m.scale; m.castShadow = m.castShadow && m.geometry.boundingSphere.radius * Math.max(sc2.x, sc2.y, sc2.z) > 4.5; } });
    const P = { g, hips, spine, head, hair, hat, apron, arms, legs, eyes, lids, brows, smile, mouth };
    /* pose(p): p = {pos:[x,y,z], yaw, hipY, lean, twist, headYaw, headPitch, headRoll, arm:[[shX,shZ,el,wrist,curl],[..]], leg:[[hip,knee,foot],[..]], blink, smile, open, brow, sway} */
    P.pose = (p) => { g.position.set(p.pos[0], p.pos[1] || 0, p.pos[2]); g.rotation.y = p.yaw || 0; hips.position.y = p.hipY === undefined ? 84 : p.hipY; hips.rotation.set(p.pitch || 0, 0, p.roll || 0); spine.rotation.set(p.lean || 0, p.twist || 0, -(p.roll || 0) * 0.6); spine.scale.set(1, 1 + (p.breath || 0), 1 + (p.breath || 0) * 1.4);
      head.rotation.set(p.headPitch || 0, p.headYaw || 0, p.headRoll || 0); hair.rotation.set((p.sway || [0, 0])[0], 0, (p.sway || [0, 0])[1]); if (hat) hat.rotation.set((p.sway || [0, 0])[0] * 1.6, 0, (p.sway || [0, 0])[1] * 1.6); if (apron) apron.rotation.set((p.sway || [0, 0, 0])[2] || 0, 0, 0);
      [0, 1].forEach((i) => { const a = (p.arm || [])[i] || [0, 0, -0.12, 0, 0.5], s = i ? 1 : -1; arms[i].sh.rotation.set(a[0], 0, s * (0.09 + (a[1] || 0))); arms[i].el.rotation.set(a[2] === undefined ? -0.12 : a[2], 0, 0); arms[i].hd.rotation.set(a[3] || 0, (a[5] || 0) * s, 0); arms[i].fingers.forEach((f, k) => { const c = (a[4] === undefined ? 0.5 : a[4]) * (0.85 + k * 0.08); f.rotation.x = -c; f.userData.tip.rotation.x = -c * 1.1; });
        const l = (p.leg || [])[i] || [0, 0, 0]; legs[i].hp.rotation.set(l[0], 0, 0); legs[i].kn.rotation.set(l[1], 0, 0); legs[i].ft.rotation.set(l[2] || 0, 0, 0); });
      const bl = p.blink || 0, sq = p.squint || 0; lids.forEach((l) => (l.rotation.x = lerp(-1.25, 0.25, Math.max(bl, sq * 0.55)))); const ex = p.eyeYaw || 0, ey = p.eyePitch || 0; eyes.forEach((e) => e.rotation.set(-ey, ex, 0));
      const sm = p.smile === undefined ? 0.5 : p.smile, op = p.open || 0; smile.scale.set(0.7 + sm * 0.5, 0.25 + sm * 0.9, 1); smile.visible = op < 0.25; mouth.visible = op >= 0.25; mouth.scale.set(2.4 + sm * 1.4, 0.3 + op * 3.0, 0.9); brows.forEach((b, i) => { b.position.y = 7.3 + (p.brow || 0) * 1.6; b.rotation.z = Math.PI / 2 + (i ? -1 : 1) * (p.browTilt || 0); }); };
    return P;
  }
  const blink = (t, off) => { const ph = (((t + off) % 3.7) + 3.7) % 3.7; return Math.max(0, 1 - Math.abs(ph - 0.09) / 0.09); };
  /* walking pose with weight: hip bob, counter-rotating chest, arms lagging the legs, secondary sway on hair/apron */
  function walkPose(t, pos, yaw, cad, o) { o = o || {}; const ph = t * cad * Math.PI, s = Math.sin(ph), sd = Math.sin(ph - 0.35), leg = (a) => { const q = Math.sin(a); return [-q * 0.5 - 0.04, Math.max(0, Math.sin(a - 1.9)) * 0.95 + 0.1, 0.1 * q]; };
    return Object.assign({ pos: [pos[0], 0, pos[2]], yaw, hipY: 83 + Math.cos(ph * 2) * 1.5, roll: s * 0.035, twist: -s * 0.1, lean: 0.045, headYaw: s * 0.05, headPitch: -0.03 + Math.cos(ph * 2 - 0.5) * 0.015, breath: 0.006 * Math.sin(t * 1.6),
      leg: [leg(ph), leg(ph + Math.PI)], arm: [[sd * 0.42, 0, -0.22 - Math.max(0, sd) * 0.3, 0, 0.55], [-sd * 0.42, 0, -0.22 - Math.max(0, -sd) * 0.3, 0, 0.55]], sway: [Math.cos(ph * 2 - 0.9) * 0.035, -Math.sin(ph - 0.6) * 0.05, Math.sin(ph * 2 - 1.1) * 0.06], blink: blink(t, o.seed || 0), smile: 0.6 }, o.over || {}); }
  function sitPose(t, pos, yaw, o) { o = o || {}; const br = Math.sin(t * 1.5 + (o.seed || 0)); return Object.assign({ pos: [pos[0], 0, pos[2]], yaw, hipY: 52, lean: 0.06 + br * 0.006, breath: 0.008 * br, leg: [[-1.5, 1.42, 0.05], [-1.46, 1.5, 0.05]], arm: [[-0.5, 0.05, -1.1, 0, 0.6], [-0.5, 0.05, -1.1, 0, 0.6]], blink: blink(t, (o.seed || 0) * 1.7), smile: 0.6, sway: [0, 0, 0] }, o.over || {}); }
  Object.assign(C4, { character, walkPose, sitPose, blink });

  /* ================= set pieces ================= */
  const P = (C4.props = {
    table(r, h, clothCol) { const g = grp(); g.add(cyl(4, 6, h - 4, MAT.paint("#1c1c1e", 0.4, 0.8), [0, (h - 4) / 2, 0])); g.add(cyl(22, 24, 2.5, MAT.paint("#1c1c1e", 0.4, 0.8), [0, 1.3, 0])); g.add(lathe([[0, h], [r, h], [r + 1.2, h - 1.2], [r + 2.4, h - 14], [r + 1.4, h - 26], [r + 3, h - 30]], MAT.cloth(clothCol || "#f3efe6", 6, 2), [0, 0, 0])); g.add(cyl(r, r, 1.2, MAT.cloth(clothCol || "#f3efe6", 4, 4), [0, h + 0.3, 0])); return g; },
    chair(col) { const g = grp(), w = MAT.wood(1, 1, col || "#4a2c1a", true); g.add(rbox(40, 5, 40, 2, w, [0, 44, 0])); g.add(rbox(38, 3, 38, 1.4, MAT.cloth("#7a2d2a", 2, 2), [0, 47.5, 0])); [[-17, -17], [17, -17], [-17, 17], [17, 17]].forEach((q) => g.add(rbox(4, 44, 4, 1.4, w, [q[0], 22, q[1]]))); [-17, 17].forEach((x) => g.add(rbox(4, 48, 4, 1.4, w, [x, 68, -18], { r: [-0.1, 0, 0] }))); g.add(rbox(40, 9, 3.5, 1.4, w, [0, 88, -20.3], { r: [-0.1, 0, 0] })); for (let i = -1; i <= 1; i++) g.add(rbox(4, 34, 2.4, 1, w, [i * 11, 68, -19], { r: [-0.1, 0, 0] })); return g; },
    plate(r) { return lathe([[0, 0.6], [r * 0.6, 0.5], [r * 0.72, 1.1], [r, 2.2], [r, 2.7], [r * 0.7, 1.6], [0, 1.2]], new T.MeshStandardMaterial({ color: "#f6f4ef", roughness: 0.18, envMapIntensity: 1, envMap: C4.ENV }), null, { seg: 24 }); },
    glass(wine) { const g = grp(); g.add(lathe([[0, 0], [3.4, 0.2], [3.4, 0.6], [0.5, 1], [0.5, 8.5], [3.6, 12], [4.2, 16], [3.5, 21]], MAT.glass("#ffffff", 0.3), [0, 0, 0], { cast: false })); if (wine) g.add(lathe([[0, 9.2], [3.2, 12], [3.9, 15.2], [0, 15.2]], new T.MeshStandardMaterial({ color: wine, roughness: 0.1, transparent: true, opacity: 0.88, envMapIntensity: 1.4 }), [0, 0, 0], { cast: false })); return g; },
    bottle(col) { return lathe([[0, 0], [3.9, 0], [4.1, 1], [4.1, 17], [3.2, 21], [1.5, 24], [1.4, 31], [1.8, 31.4], [1.8, 32.4], [0, 32.4]], new T.MeshStandardMaterial({ color: col || "#234a2c", roughness: 0.08, metalness: 0, envMapIntensity: 1.1, envMap: C4.ENV }), null, { seg: 14 }); },
    candle() { const g = grp(); g.add(cyl(3.2, 3.6, 4.4, MAT.glass("#ffd9a0", 0.45), [0, 2.2, 0], { cast: false })); g.add(cyl(1.6, 1.6, 3.2, new T.MeshStandardMaterial({ color: "#f3e9d2", roughness: 0.6, emissive: "#ff9a3c", emissiveIntensity: 0.5 }), [0, 1.9, 0], { cast: false })); const f = sph(1, MAT.glow("#ffc070", 3.2), [0, 5.2, 0], { s: [0.75, 1.7, 0.75], cast: false }); f.userData.dyn = true; g.add(f); g.userData.flame = f; return g; },
    pendant(len, shadeCol) { const g = grp(); g.add(cyl(0.35, 0.35, len, MAT.paint("#111", 0.6), [0, -len / 2, 0], { cast: false })); g.add(lathe([[2, 0], [3, -2], [15, -14], [16, -15.5], [15.4, -15.5], [2.4, -1], [0, -1]], MAT.paint(shadeCol || "#b0762c", 0.35, 0.9), [0, -len, 0], { cast: false })); g.add(sph(3.6, MAT.glow("#ffd9a0", 4.5), [0, -len - 10, 0], { cast: false })); g.userData.bulbY = -len - 10; return g; },
    frame(w, h, hue) { const g = grp(); g.add(rbox(w + 5, h + 5, 2.6, 1, MAT.wood(1, 1, "#2a1a10", true), [0, 0, 0], { cast: false })); const c = cnv(128, (x, s) => { const gr = x.createLinearGradient(0, 0, s, s); gr.addColorStop(0, "hsl(" + hue + ",38%,46%)"); gr.addColorStop(1, "hsl(" + (hue + 40) + ",30%,22%)"); x.fillStyle = gr; x.fillRect(0, 0, s, s); x.fillStyle = "rgba(255,240,210,0.5)"; x.beginPath(); x.arc(s * 0.62, s * 0.4, s * 0.16, 0, 6.3); x.fill(); x.fillStyle = "rgba(20,14,10,0.55)"; x.fillRect(0, s * 0.68, s, s * 0.32); }); g.add(mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tx(c, 1, 1, true), roughness: 0.5 }), [0, 0, 1.5], { cast: false })); return g; },
    plant(s) { const g = grp(); g.add(lathe([[0, 0], [9, 0], [12, 20], [10.5, 20], [8.4, 2], [0, 2]], MAT.paint("#8a4f33", 0.8), [0, 0, 0])); const lm = new T.MeshStandardMaterial({ color: "#2f5a34", roughness: 0.6, envMapIntensity: 0.6 }), r = rng(s || 3); for (let i = 0; i < 16; i++) { const a = r() * 6.3, e = 0.3 + r() * 1.1, l = sph(1, lm, [Math.cos(a) * 9 * Math.sin(e), 26 + Math.cos(e) * 18 + r() * 8, Math.sin(a) * 9 * Math.sin(e)], { s: [3.4, 11, 6.5], r: [Math.sin(a) * e * 0.8, a, Math.cos(a) * e * 0.8] }); g.add(l); } return g; },
    neon(text, col, w) { const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const x = c.getContext("2d"); x.clearRect(0, 0, 1024, 256); x.font = 'italic 400 150px "Instrument Serif", Georgia, serif'; x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = col; x.shadowBlur = 34; x.fillStyle = col; x.fillText(text, 512, 132); x.shadowBlur = 10; x.fillStyle = "#fff"; x.globalAlpha = 0.75; x.fillText(text, 512, 132); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; const m = new T.Mesh(new T.PlaneGeometry(w, w / 4), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, color: new T.Color(2.2, 2.2, 2.2) })); return m; },
    beam(r, h, col, op) { const c = cnv(64, (x, s) => { const g = x.createLinearGradient(0, 0, 0, s); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, s, s); }), m = new T.Mesh(new T.CylinderGeometry(r * 0.12, r, h, 40, 1, true), new T.MeshBasicMaterial({ color: col, map: new T.CanvasTexture(c), transparent: true, opacity: op || 0.07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })); m.position.y = -h / 2; return m; },
  });
  /* floating dust lit by the practicals: positions are a pure function of t */
  function dust(n, box, seed) { const r = rng(seed || 5), base = [], g = new T.BufferGeometry(), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) base.push([box[0] + r() * (box[3] - box[0]), box[1] + r() * (box[4] - box[1]), box[2] + r() * (box[5] - box[2]), r() * 6.3, 0.2 + r() * 0.5]); g.setAttribute("position", new T.BufferAttribute(pos, 3));
    const c = cnv(32, (x) => { const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); }), pts = new T.Points(g, new T.PointsMaterial({ map: new T.CanvasTexture(c), size: 1.5, transparent: true, opacity: 0.22, color: "#ffd9a8", blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false })); pts.frustumCulled = false;
    pts.userData.update = (t) => { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * b[4] + b[3]) * 9; pos[i * 3 + 1] = b[1] + Math.sin(t * b[4] * 0.7 + b[3] * 2) * 6 + ((t * 2.2 * b[4]) % 30); pos[i * 3 + 2] = b[2] + Math.cos(t * b[4] * 0.9 + b[3]) * 9; } g.attributes.position.needsUpdate = true; }; return pts; }
  /* three-point light rig around a subject + ambient bounce; key casts soft high-resolution shadows */
  function threePoint(sc, o) { const key = new T.SpotLight(o.keyCol || "#ffd2a0", o.key || 2.2, 0, o.angle || 0.75, 1, 0); key.position.set(o.keyPos[0], o.keyPos[1], o.keyPos[2]); key.target.position.set(o.target[0], o.target[1], o.target[2]); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6; key.shadow.radius = 3; key.shadow.camera.near = 50; key.shadow.camera.far = 1800; sc.add(key); sc.add(key.target);
    const fill = new T.DirectionalLight(o.fillCol || "#9db8ff", o.fill === undefined ? 0.35 : o.fill); fill.position.set(o.fillPos[0], o.fillPos[1], o.fillPos[2]); sc.add(fill); const rim = new T.DirectionalLight(o.rimCol || "#ffb070", o.rim === undefined ? 1.1 : o.rim); rim.position.set(o.rimPos[0], o.rimPos[1], o.rimPos[2]); rim.target.position.set(o.target[0], o.target[1], o.target[2]); sc.add(rim); sc.add(rim.target);
    const hemi = new T.HemisphereLight(o.sky || "#6a5a52", o.ground || "#2a160c", o.amb === undefined ? 0.5 : o.amb); sc.add(hemi); lights.key = key; lights.keyBase = o.keyPos.slice(); return { key, fill, rim, hemi }; }
  /* additive light pool: a cheap stand-in for a practical light that does not need a real light source */
  function pool(w, h, col, op) { const c = cnv(128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.5, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }), m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), color: col, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, fog: false })); return m; }
  const noShadow = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = false; } }); return o; }, noRecv = (o) => { o.traverse((m) => { if (m.isMesh) m.receiveShadow = false; }); return o; };
  /* contact shadow: baked stand-in for the shadow / occlusion of static furniture */
  function blob(w, d, op) { const c = cnv(64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.55, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), k = "blob" + op, m = new T.Mesh(new T.PlaneGeometry(w, d), (blob[k] = blob[k] || new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, opacity: op || 0.5, depthWrite: false, fog: false }))); m.rotation.x = -Math.PI / 2; m.castShadow = false; m.receiveShadow = false; return m; }
  /* merge every static mesh under `root` into one mesh per material: static geometry costs a handful of draw calls */
  function bake(root) { root.updateMatrixWorld(true); const groups = new Map(), rm = []; root.traverse((m) => { if (!m.isMesh) return; for (let q = m; q && q !== root.parent; q = q.parent) if (q.userData && q.userData.dyn) return; const key = m.material.uuid + (m.receiveShadow ? "r" : "") + (m.renderOrder || 0); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(m); rm.push(m); });
    const v = new T.Vector3(), nm = new T.Matrix3(), inv = root.matrixWorld.clone().invert(), ml = new T.Matrix4(); let before = rm.length, after = 0; /* vertices are stored in the root's local space so the root can still be moved */
    groups.forEach((list) => { let nv = 0, ni = 0; list.forEach((m) => { const g = m.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }); const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), U = new Float32Array(nv * 2), I = new Uint32Array(ni); let vo = 0, io = 0;
      list.forEach((m) => { const g = m.geometry, p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, flip = m.matrixWorld.determinant() < 0; ml.multiplyMatrices(inv, m.matrixWorld); nm.getNormalMatrix(ml);
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(ml); P[(vo + i) * 3] = v.x; P[(vo + i) * 3 + 1] = v.y; P[(vo + i) * 3 + 2] = v.z; v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N[(vo + i) * 3] = v.x; N[(vo + i) * 3 + 1] = v.y; N[(vo + i) * 3 + 2] = v.z; if (u) { U[(vo + i) * 2] = u.getX(i); U[(vo + i) * 2 + 1] = u.getY(i); } }
        const cnt = g.index ? g.index.count : p.count; for (let j = 0; j < cnt; j += 3) { const a = g.index ? g.index.getX(j) : j, b = g.index ? g.index.getX(j + 1) : j + 1, c = g.index ? g.index.getX(j + 2) : j + 2; I[io++] = vo + a; I[io++] = vo + (flip ? c : b); I[io++] = vo + (flip ? b : c); } vo += p.count; });
      const G = new T.BufferGeometry(); G.setAttribute("position", new T.BufferAttribute(P, 3)); G.setAttribute("normal", new T.BufferAttribute(N, 3)); G.setAttribute("uv", new T.BufferAttribute(U, 2)); G.setIndex(new T.BufferAttribute(I, 1)); const M = new T.Mesh(G, list[0].material); M.castShadow = false; M.receiveShadow = list[0].receiveShadow; M.renderOrder = list[0].renderOrder; M.frustumCulled = false; M.userData.baked = true; root.add(M); after++; });
    rm.forEach((m) => m.parent.remove(m)); return { before, after }; }
  Object.assign(C4, { dust, threePoint, lights, pool, noShadow, noRecv, blob, bake });
})(typeof window !== "undefined" ? window : globalThis);
