const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;

const apiKey = process.env.RAWG_API_KEY;
const url1 = "https://api.rawg.io/api/games?key=" + apiKey;
const url = `https://api.rawg.io/api/games/3498/screenshots?key=${apiKey}`;



// Update the getGames function to return the fetched data
async function getGames(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json; // Return the JSON data
  } catch (error) {
    console.error(error.message);
    throw error; // Rethrow the error so it can be handled by the caller
  }
}

app.get('/getGames', async (req, res) => {
  try {
    const games = await getGames(url); // Await the data from getGames
    res.json(games); // Send the JSON response to the client
  } catch (error) {
    res.status(500).send({ error: error.message }); // Handle errors and send an error response
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
