// render4.cjs <project> <preview|final> [workers]
// Engine 4 renderer: parallel browser workers, per-shot frame cache, live progress log with measured s/frame and ETA,
// constant-frame-rate encode and the automatic gate (camera smoothness, frame count, duplicated frames).
const { chromium } = require("playwright"), fs = require("fs"), path = require("path"), crypto = require("crypto"), cp = require("child_process");
const E = __dirname, proj = path.resolve(process.argv[2]), mode = process.argv[3] || "final", NW = +(process.argv[4] || 1) /* measured: extra workers do not help on software GL, it already uses every core */, name = path.basename(proj);
const PRE = mode === "preview", q = PRE ? { preview: true } : {}, step = PRE ? 2 : 1, T0 = Date.now(), ph = {};
const clock = () => new Date().toTimeString().slice(0, 8), log = (s) => { const l = clock() + "  " + s; console.log(l); fs.appendFileSync(path.join(proj, "renders", "progress.log"), l + "\n"); };
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);
const ARGS = ["--no-sandbox", "--enable-webgl", "--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"];
(async () => {
  fs.mkdirSync(path.join(proj, "renders"), { recursive: true }); fs.writeFileSync(path.join(proj, "renders", "progress.log"), "");
  log("render " + name + " mode=" + mode + " workers=" + NW);
  if (!PRE) { try { cp.execFileSync("node", [path.join(E, "camcheck.cjs"), proj], { stdio: "pipe" }); log("gate: camera smoothness ok"); } catch (e) { log("GATE-FAIL camera\n" + (e.stdout || "")); process.exit(1); } }
  const eng = sha(fs.readFileSync(path.join(proj, "assets/vendor/apx4.js")) + JSON.stringify(q) + step), url = "file://" + path.join(E, "host.html") + "?p=" + encodeURIComponent(proj);
  let t = Date.now(); const open = async () => { const b = await chromium.launch({ args: ARGS }), p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on("pageerror", (e) => log("PAGE ERROR " + e.message)); await p.goto(url); const info = await p.evaluate((q) => window.boot(q), q); return { b, p, info }; };
  const first = await open(), info = first.info, fps = info.fps, total = Math.round(info.D * fps); ph.load = (Date.now() - t) / 1000;
  log("scene loaded in " + ph.load.toFixed(1) + " s (build " + (info.build_ms / 1000).toFixed(1) + " s) · " + total + " frames at " + fps + " fps" + (PRE ? " · preview renders 1 frame in " + step + " at 540x960" : " · 1080x1920"));
  /* frame list with per-shot cache */
  const cdir = path.join(proj, "renders", "cache-" + mode), jobs = [], files = []; let cached = 0;
  info.shots.forEach((s, i) => { const d = path.join(cdir, "shot" + String(i).padStart(2, "0") + "-" + sha(eng + info.common + s.key)); fs.mkdirSync(d, { recursive: true }); const f0 = Math.ceil(s.t0 * fps - 1e-6), f1 = Math.ceil(s.t1 * fps - 1e-6) - 1;
    for (let f = f0; f <= f1; f++) { if ((f - 0) % step) continue; const file = path.join(d, "f" + String(f).padStart(6, "0") + ".jpg"); files.push(file); if (fs.existsSync(file)) cached++; else jobs.push([f, file]); } });
  fs.readdirSync(cdir).forEach((d) => { if (!files.some((f) => path.dirname(f) === path.join(cdir, d))) fs.rmSync(path.join(cdir, d), { recursive: true, force: true }); });
  log("frames to render " + jobs.length + " · from cache " + cached);
  /* workers */
  t = Date.now(); let done = 0, rMs = 0, cMs = 0; const n = Math.max(1, Math.min(NW, Math.ceil(jobs.length / 20))), W = [first]; for (let i = 1; i < n && jobs.length; i++) W.push(await open());
  const chunk = Math.ceil(jobs.length / W.length), tick = setInterval(() => { const el = (Date.now() - t) / 1000, spf = done ? el / done : 0; log("frames " + done + "/" + jobs.length + " · " + spf.toFixed(2) + " s/frame (wall) · elapsed " + el.toFixed(0) + " s · remaining " + (spf * (jobs.length - done)).toFixed(0) + " s"); }, 10000);
  await Promise.all(W.map(async (w, wi) => { for (const [f, file] of jobs.slice(wi * chunk, (wi + 1) * chunk)) { const r = await w.p.evaluate(([f, pw, qq]) => window.frame(f, pw, qq), [f, PRE ? 540 : 0, PRE ? 0.82 : 0.95]); const a = Date.now(); fs.writeFileSync(file + ".tmp", Buffer.from(r[0].split(",")[1], "base64")); fs.renameSync(file + ".tmp", file); rMs += r[1]; cMs += r[2] + (Date.now() - a); done++; } await w.b.close(); }));
  clearInterval(tick); ph.render = (Date.now() - t) / 1000; log("frames done " + done + " in " + ph.render.toFixed(1) + " s · " + (done ? (ph.render / done).toFixed(2) : "0") + " s/frame wall · per worker: frame compute " + (done ? (rMs / done / 1000).toFixed(2) : 0) + " s, jpeg+write " + (done ? (cMs / done / 1000).toFixed(3) : 0) + " s");
  /* encode at constant frame rate */
  t = Date.now(); const seq = path.join(proj, "renders", ".seq-" + mode); fs.rmSync(seq, { recursive: true, force: true }); fs.mkdirSync(seq); files.forEach((f, i) => fs.symlinkSync(f, path.join(seq, String(i).padStart(6, "0") + ".jpg")));
  const ofps = fps / step, outF = path.join(proj, "renders", name + (PRE ? "-preview.mp4" : "-9x16.mp4")), au = path.join(proj, "assets/audio/mix.m4a"), a = ["-v", "error", "-y", "-framerate", String(ofps), "-i", path.join(seq, "%06d.jpg")];
  if (fs.existsSync(au)) a.push("-i", au, "-c:a", "aac", "-b:a", "192k", "-shortest"); a.push("-c:v", "libx264", "-preset", PRE ? "veryfast" : "medium", "-crf", PRE ? "24" : "15", "-pix_fmt", "yuv420p", "-r", String(ofps), "-fps_mode", "cfr", "-movflags", "+faststart", outF);
  cp.execFileSync("ffmpeg", a); fs.rmSync(seq, { recursive: true, force: true }); ph.encode = (Date.now() - t) / 1000;
  /* gate */
  const pr = cp.execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate,avg_frame_rate,nb_frames", "-of", "csv=p=0", outF]).toString().trim().split(","); let ok = pr[0] === ofps + "/1" && pr[1] === ofps + "/1" && +pr[2] === files.length, dup = 0;
  if (!PRE) { const r = cp.spawnSync("ffmpeg", ["-i", outF, "-vf", "mpdecimate=hi=64:lo=32:frac=0.05", "-loglevel", "debug", "-f", "null", "-"]); dup = (r.stderr.toString().match(/drop pts/g) || []).length; if (dup > +(process.env.MAXDUP || 0)) ok = false; }
  log("phases: load " + ph.load.toFixed(1) + " s · render " + ph.render.toFixed(1) + " s · encode " + ph.encode.toFixed(1) + " s · TOTAL " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  log("gate: stream " + pr.join(",") + " · expected frames " + files.length + (PRE ? "" : " · duplicated frames " + dup) + " → " + (ok ? "GATE-OK" : "GATE-FAIL")); if (!ok) { fs.renameSync(outF, outF.replace(".mp4", ".rejected.mp4")); process.exit(1); }
  log("output " + outF);
})().catch((e) => { log("FATAL " + e.message); process.exit(1); });
