const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg'); // PostgreSQL client to interact with the database
const { getRandomSentence } = require('./connection'); // Importing the function to fetch random sentence from database

const app = express();
const GAME_PORT = process.env.GAME_PORT || 3000; // Port for game server
const LEADERBOARD_PORT = process.env.LEADERBOARD_PORT || 3001; // Port for leaderboard server (if needed)

// PostgreSQL Client Setup
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'game',
});

client.connect();

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());

// Game Route to fetch a random sentence
app.get('/random-sentence', async (req, res) => {
  try {
    const sentence = await getRandomSentence();  // Fetch a random sentence from the database
    if (sentence) {
      res.json({ sentence });  // Respond with the sentence in JSON format
    } else {
      res.status(404).json({ error: 'No sentences found' });  // Return an error if no sentence is found
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random sentence' });  // Return error if there's an issue with the query
  }
});

// Leaderboard Route to Fetch Top 5 Results
app.get('/leaderboard', async (req, res) => {
  try {
    // Query to fetch the top 5 players based on score
    const query = `
      SELECT player_name, score
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 5;
    `;
    const result = await client.query(query);
    res.status(200).json(result.rows); // Return the top 5 results
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching leaderboard');
  }
});

// Route to Submit or Update a Player's Score
app.post('/leaderboard', async (req, res) => {
  const { player_name, score } = req.body;

  try {
    // Query to insert or update the player's score
    const query = `
      INSERT INTO leaderboard (player_name, score)
      VALUES ($1, $2)
      ON CONFLICT (player_name)
      DO UPDATE SET score = EXCLUDED.score;
    `;
    await client.query(query, [player_name, score]);

    res.status(200).send('Score added/updated successfully!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error adding/updating score');
  }
});

// Start the Game Server
app.listen(GAME_PORT, () => {
  console.log(`Game server running on port ${GAME_PORT}`);
});

// Optionally, you can have a separate leaderboard server running on a different port if needed
const leaderboardApp = express();

leaderboardApp.use(cors());
leaderboardApp.use(bodyParser.json());

// Example leaderboard endpoint (can be modified as per your needs)
leaderboardApp.get('/leaderboard', async (req, res) => {
  try {
    // Query to fetch the top 5 players based on score
    const query = `
      SELECT player_name, score
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 5;
    `;
    const result = await client.query(query);
    res.status(200).json(result.rows); // Return the top 5 results
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching leaderboard');
  }
});

// Start the Leaderboard Server (if needed)
leaderboardApp.listen(LEADERBOARD_PORT, () => {
  console.log(`Leaderboard server running on port ${LEADERBOARD_PORT}`);
});
