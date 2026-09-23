require('./config/env');

const app = require('./app');
const { connectToDatabase } = require('./config/db');

const port = Number(process.env.PORT) || 4000;

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`PEC5 API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start the PEC5 API:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
