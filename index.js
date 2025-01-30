const express = require('express');
const cors = require('cors')
import { removeFromCloud } from "./cloudinaryConfig.js";
const app = express();
app.use(cors())
app.use(express.json());
const port = 3000;

const apiKey = process.env.RAWG_API_KEY;

async function getGames() {
  const url = "https://api.rawg.io/api/games?key=" + apiKey;
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

async function getGame(id) {
  const url = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;

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

app.delete("/list/:id", async (req, resp) => {
  try {
    const { id } = req.params;
    removeFromCloud(id);
    resp.json({ msg: "Successfull deletion" });
  } catch (error) {
    console.log(error);
  }
});




app.get('/getGames', async (req, res) => {
  try {
    const games = await getGames(); 
    res.json(games);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.get('/getGame/:id', async (req, res) => {
  let id =req.params.id
  try {
    const game = await getGame(id); 
    res.json(game);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
