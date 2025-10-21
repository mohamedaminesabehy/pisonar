// controllers/eventSchedulerController.js

const { spawn } = require('child_process');
const path = require('path');

exports.runWeeklySchedule = (req, res) => {
  // Chemin absolu vers votre script Python
  const scriptPath = path.resolve(__dirname, '../EventMl/event_model.py');


  // const pythonExe = '/opt/anaconda3/bin/python';
    // Choix du binaire Python selon l'OS
    const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
  // Lancement du script Python
  const py = spawn(pythonExe, [scriptPath]);

  let stdout = '';
  let stderr = '';

  py.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  py.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  py.on('close', (code) => {
    if (code === 0) {
      // On renvoie la sortie standard et le nombre d'événements créés
      // Dernière ligne du script affiche : "Total new weekly events created: X"
      const match = stdout.match(/Total new weekly events created:\s*(\d+)/i);
      const count = match ? parseInt(match[1], 10) : null;

      return res.json({
        message: 'Weekly scheduling completed',
        createdCount: count,
        log: stdout.trim(),
      });
    } else {
      return res.status(500).json({
        error: 'Script failed',
        code,
        details: stderr.trim(),
      });
    }
  });
};



 