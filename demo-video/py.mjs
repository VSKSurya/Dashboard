// Run a Python script with the right interpreter.   node py.mjs vo.py
// Windows: "python" (if it really runs), else the "py" launcher. "python3" there is often the Microsoft Store stub.
// Mac and Linux: "python3". Set PYTHON to override.
import { spawnSync } from "node:child_process";
const works = (cmd) => spawnSync(cmd, ["-c", "import sys; sys.exit(sys.version_info < (3, 9))"]).status === 0;
const py = process.env.PYTHON || (process.platform !== "win32" ? "python3" : works("python") ? "python" : "py");
const r = spawnSync(py, process.argv.slice(2), { stdio: "inherit" });
if (r.error) console.error(`could not start ${py}: ${r.error.message}. Install Python 3, or set PYTHON to its path.`);
process.exit(r.status ?? 1);
