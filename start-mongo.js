const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// Check if MongoDB is already running on 27017
const checkRunning = () => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(27017, '127.0.0.1');
  });
};

async function main() {
  const isUp = await checkRunning();
  if (isUp) {
    console.log('✅ MongoDB is already active and listening on mongodb://127.0.0.1:27017');
    console.log('You can now run: npm run seed OR npm start');
    return;
  }

  const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe';
  if (!fs.existsSync(mongodPath)) {
    console.error('❌ Could not locate mongod.exe at:', mongodPath);
    console.error('Please verify your MongoDB installation path.');
    process.exit(1);
  }

  const dbDir = path.join(process.env.USERPROFILE || process.env.HOME || '.', 'mongodb_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('🚀 Starting MongoDB...');
  console.log(`📁 Database directory: ${dbDir}`);
  console.log('🔌 Port: 27017');

  const proc = spawn(mongodPath, ['--dbpath', dbDir, '--port', '27017'], {
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error('❌ Failed to launch mongod:', err.message);
  });

  proc.on('exit', (code) => {
    console.log(`MongoDB stopped with code ${code}`);
  });

  process.on('SIGINT', () => {
    console.log('\nStopping MongoDB...');
    proc.kill();
    process.exit(0);
  });
}

main();
