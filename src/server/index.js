import express from 'express';
import path from 'path';
require("regenerator-runtime/runtime");
require("regenerator-runtime/path").path;

import Dates from './db';
import {patternToUnixTime} from '../utils';

const root = path.join(__dirname, '../../');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(root, 'dist/client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'dist/client', 'index.html'));
});

app.get('/dates', (req, res, next) => {
  Dates.all().then(rows => {
    res.status(200).json(rows);
  })
})
app.post('/dates', (req, res, next) => {
  const rows = req.body;
  const errors = [];
  rows.forEach(async (row) => {
    const data = {
      userid: row[0],
      regdate: patternToUnixTime(row[1]),
      lastdate: patternToUnixTime(row[2]),
    };
    try {
      await Dates.create(data);
    } catch (err) {
      console.error("ERROR=", err.message);
      errors.push(err.message);
    }

  });

  if (errors.length > 0) {
    res.status(500).json(errors);
  } else {
    res.sendStatus(201);
  }
});

app.get('/dates/rolling-retention/:day', (req, res, next) => {
  //partial parse is not a problem!
  const xday = parseInt(req.params.day);

  if (xday > 0) {
    Dates.rollingRetention(xday).then(row => {
      const {regs, rets} = row;
      if (regs > 0) {
        res.send((rets / regs * 100).toFixed(0));
      } else {
        res.send('Not available');
      }
    })
      .catch(err => {
        res.status(500).send(err.message);
      });
  } else {
    res.status(422).send('Invalid xday parameter');
  }
})

app.delete('/dates', (req, res,next) => {
  Dates.deleteAll()
    .then(() => {
      res.sendStatus(200);
    }).catch((err) => {
      res.status(500).send('Delete failed ' + err.message);
  })
})

app.listen(port, () => console.log(`Listening on port ${port}!`));
