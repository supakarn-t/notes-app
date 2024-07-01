require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", () => {
	console.log("Connected to MongoDB ✅");
});

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 8080;
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());
app.use(cors({ origin: "*" }));

// start server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT} 🌎`);
});

app.get("/", (req, res) => {
	res.json({ data: "respond received from the server!" });
});

module.exports = app;
