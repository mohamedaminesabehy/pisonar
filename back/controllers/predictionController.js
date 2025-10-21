const mongoose     = require("mongoose");
const { promisify } = require("util");
const { execFile }  = require("child_process");
const path         = require("path");

const execFileAsync = promisify(execFile);

exports.predictPatients = async (req, res) => {
//  const pythonExe  = "/opt/anaconda3/bin/python";
  const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
  const classifier = path.join(__dirname, "../TrieML/TrieXGB.py");
  const wtScript   = path.join(__dirname, "../WT/WT.py");

  // Clean WT up front
  await mongoose.connection.db.collection("WT").deleteMany({});

  try {
    // 1) Run classifier.py
    const { stdout: out1, stderr: log1 } = await execFileAsync(pythonExe, [classifier]);
    if (log1) console.warn("Classifier stderr:", log1);
    let patients = JSON.parse(out1);

    // 2) sort + filter
    const priority = { critical:1, moderate:2, low:3 };
    patients.sort((a,b) => {
      const aDis = a.status?.toLowerCase()==="discharged";
      const bDis = b.status?.toLowerCase()==="discharged";
      if (aDis !== bDis) return aDis ? 1 : -1;
      return (priority[a.state]||99) - (priority[b.state]||99);
    });
    const waiting = patients.filter(p => p.status === "Waiting for Doctor");

    // 3) count unique staff
    const events = await mongoose.connection.db.collection("events").find().toArray();
    const docSet = new Set(), nurSet = new Set();
    events.forEach(ev => {
      (ev.assignedDoctors||[]).forEach(d=>docSet.add(String(d)));
      (ev.assignedNurses ||[]).forEach(n=>nurSet.add(String(n)));
    });
    const available_doctors = docSet.size;
    const available_nurses  = nurSet.size;

    // 4) prepare WT docs
    const toInsert = waiting.map((p, idx) => {
      const { createdAt, ...rest } = p;
      return {
        ...rest,
        available_doctors,
        available_nurses,
        num_patients_waiting: idx+1
      };
    });
    if (toInsert.length) {
      await mongoose.connection.db.collection("WT").insertMany(toInsert);
    }

    // 5) run WT.py
    const { stdout: out2, stderr: log2 } = await execFileAsync(pythonExe, [wtScript]);
    if (log2) console.warn("WT script stderr:", log2);

    let resultJson;
    try {
      resultJson = JSON.parse(out2);
    } catch(parseErr) {
      throw { msg: "Invalid JSON from WT.py", details: parseErr.message };
    }

    // 6) cleanup
    await mongoose.connection.db.collection("WT").deleteMany({});

    // 7) only send the predictions array
    return res.json(resultJson.predictions || []);

  } catch (err) {
    console.error("Error in predictPatients:", err);
    await mongoose.connection.db.collection("WT").deleteMany({});
    return res.status(500).json({
      error:   err.msg   || "Internal error",
      details: err.details || err.message
    });
  }
};
