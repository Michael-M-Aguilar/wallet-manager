require('dotenv/config');
const express = require('express');
const pg = require('pg');
const errorMiddleware = require('./error-middleware');
const jsonMiddleware = express.json();
const staticMiddleware = require('./static-middleware');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

app.use(staticMiddleware);
app.use(jsonMiddleware);

// Get information necessary for entries to present in body.
app.get('/api/entries', (req, res) => {

  const sql = `
  SELECT
  "userId",
  "amount",
  "note",
  "location",
  "firstName"
  FROM "entries"
  JOIN "users" using ("userId");
  `;
  // no params so no 2nd argumnet needed.
  db.query(sql)
    .then(result => {
      // console.log('DB Result', result);
      const userInfo = result.rows;
      // res.json({ test: 'This a test' });
      res.json(userInfo);
    });

});
// To get my categories from it's respective table
app.get('/api/categories', (req, res) => {
  const sql = `
  SELECT DISTINCT
  "catName",
  "categoryId"
  FROM "categories"
  JOIN "entries" using ("categoryId")
  `;

  db.query(sql)
    .then(result => {
      // console.log('DB GetResult', result);
      const categories = result.rows;
      res.json(categories);
    });
});

// Code in here.
// To help post credit entries
app.post('/api/entries/', (req, res) => {
  const { category, amount, note, location, date } = req.body;
  // console.log('The value of req.body', req.body);
  const sql = `
  INSERT INTO "entries" ("userId", "accountId", "categoryId", "amount", "note", "location", "date")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `;

  const params = [1, 1, category, amount, note, location, date];
  db.query(sql, params)
    .then(result => {
      const [entry] = result.rows;
      // console.log('This is the CL of entry only', entry);
      res.status(201).json(entry);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'an unexpected error occured'
      });
    });
});

app.post('/api/debit/', (req, res) => {
  const { category, amount, note, location, date } = req.body;
  // console.log('The value of req.body', req.body);
  const sql = `
  INSERT INTO "entries" ("userId", "accountId", "categoryId", "amount", "note", "location", "date")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `;

  const params = [1, 1, category, amount, note, location, date];
  db.query(sql, params)
    .then(result => {
      const [entry] = result.rows;
      // console.log('This is the CL of entry only', entry);
      res.status(201).json(entry);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'an unexpected error occured'
      });
    });
});
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
