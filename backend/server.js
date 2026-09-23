require('./config/env');

const app = require('./app');

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`PEC5 API listening on port ${port}`);
});

module.exports = app;
