const { Client } = require('pg');

// Use environment variables for more secure configuration
const client = new Client({
    host: 'localhost', // Verify the host
    port: 5432,        // Default PostgreSQL port
    user: 'postgres',  // Your PostgreSQL username
    password: '12345678', // Your password
    database: 'game'      // Name of the database
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// Function to get a random sentence from normal_sentences table
async function getRandomSentence() {
    try {
        const result = await client.query(
            'SELECT sentence FROM normal_sentences ORDER BY RANDOM() LIMIT 1'
        );
        return result.rows.length > 0 ? result.rows[0].sentence : null;
    } catch (err) {
        console.error('Error fetching random sentence:', err);
        return null;
    }
}

// Optional function to add a sentence if needed
async function addSentence(sentence) {
    try {
        await client.query(
            'INSERT INTO normal_sentences (sentence) VALUES ($1)', 
            [sentence]
        );
        console.log(`Sentence added: ${sentence}`);
        return true;
    } catch (err) {
        console.error('Error adding sentence:', err);
        return false;
    }
}

// Handle potential database connection errors
client.on('error', (err) => {
    console.error('Unexpected database error', err);
});

module.exports = { 
    client, 
    addSentence,
    getRandomSentence
};