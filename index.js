import { removeFromCloud } from "./cloudinaryConfig.js";
const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("./FirebaseAPI.json")),
});

const db = admin.firestore();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const apiKey = process.env.RAWG_API_KEY;

// Function to deactivate expired events
async function deactivateExpiredEvents() {
  const now = admin.firestore.Timestamp.now();

  try {
    const snapshot = await db.collection("Events")
      .where("isActive", "==", true)
      .where("endDate", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No expired events found.");
      return;
    }

    const batch = db.batch();

    snapshot.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });

    await batch.commit();
    console.log(`Updated ${snapshot.size} expired events.`);
  } catch (error) {
    console.error("Error updating events:", error);
  }
}

async function startDeactivationCycle() {
  await deactivateExpiredEvents();
  setTimeout(startDeactivationCycle, 10 * 1000); // Schedule next run only after completion
}

startDeactivationCycle();

// RAWG API functions
async function getGames() {
  const url = "https://api.rawg.io/api/games?key=" + apiKey;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function getGenres() {
  const url = "https://api.rawg.io/api/genres?key=" + apiKey;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function searchGames(gameName, query) {
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${gameName}&ordering=-${query}&search_precise=true`;
  console.log("Fetching URL:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function getGame(id) {
  const url = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Express routes
app.delete("/list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    removeFromCloud(id);
    res.json({ msg: "Successful deletion" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/getGames", async (req, res) => {
  try {
    const games = await getGames();
    res.json(games);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.get("/getGenres", async (req, res) => {
  try {
    const genres = await getGenres();
    res.json(genres);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.get("/getGame/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const game = await getGame(id);
    res.json(game);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.get("/searchGame/:gameName", async (req, res) => {
  let gameName = req.params.gameName;
  let ordering = req.query.ordering || "rating";
  console.log(ordering);

  try {
    const game = await searchGames(gameName, ordering);
    res.json(game);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.delete("/deleteUser/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: `User with UID ${uid} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
