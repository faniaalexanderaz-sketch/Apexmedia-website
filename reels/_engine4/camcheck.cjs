// camcheck.cjs <project> : camera smoothness gate (pure math, no browser). Exit 1 on failure.
const fs = require("fs"), vm = require("vm"), P = process.argv[2];
const ctx = { console, Math }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
const run = (f) => vm.runInContext("(function(){var module=undefined;var window=globalThis;" + fs.readFileSync(f, "utf8") + "\n})()", ctx);
run(P + "/assets/vendor/apx4.js"); if (fs.existsSync(P + "/assets/vendor/kit4.js")) run(P + "/assets/vendor/kit4.js"); run(P + "/assets/vendor/film.js");
const rep = ctx.C4.camReport(ctx.FILM4.shots, ctx.FILM4.fps);
console.log(JSON.stringify(rep.shots)); if (!rep.ok) { console.log("CAMERA CHECK FAILED\n" + rep.issues.join("\n")); process.exit(1); } console.log("camera check ok");
