const { spawn } = require('child_process');
const path       = require('path');

exports.processQuery = (req, res) => {
  const { query } = req.body;
  const pythonScriptPath = path.resolve(__dirname, '../ChatBotMl/src/main.py');
  console.log(`Executing Python script at: ${pythonScriptPath}`);

  const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
  // const pythonExe  = "/opt/anaconda3/bin/python";
  // Lancement avec python3
  const pythonProcess = spawn(pythonExe, [pythonScriptPath, query]);

  let response = '';
  let errorOccurred = false;

  // Timeout après 5 minutes
  const timeoutMs = 15 * 60 * 1000; // 300 000 ms
  const timeout = setTimeout(() => {
    errorOccurred = true;
    pythonProcess.kill('SIGKILL');
    if (!res.headersSent) {
      res.status(504).json({ error: 'Chatbot processing timeout' });
    }
  }, timeoutMs);

  // Capture de la sortie standard
  pythonProcess.stdout.on('data', (data) => {
    response += data.toString();
  });

  // Capture des erreurs
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
    if (!res.headersSent && !errorOccurred) {
      errorOccurred = true;
      clearTimeout(timeout);
      res.status(500).json({ error: 'Chatbot error', details: data.toString() });
    }
  });

  // Cas où le processus ne peut pas démarrer
  pythonProcess.on('error', (err) => {
    console.error(`Spawn Error: ${err}`);
    if (!res.headersSent && !errorOccurred) {
      errorOccurred = true;
      clearTimeout(timeout);
      res.status(500).json({ error: 'Failed to start Python process', details: err.message });
    }
  });

  // À la fermeture normale du process
  pythonProcess.on('close', (code) => {
    clearTimeout(timeout);
    if (errorOccurred) return;
    if (code !== 0) {
      return res.status(500).json({
        error:    'Chatbot process exited with error',
        exitCode: code
      });
    }
    res.json({ response });
  });
};
