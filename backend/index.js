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
const e = require("express");

app.use(express.json());
app.use(cors({ origin: "*" }));

// start server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT} 🌎`);
});

app.get("/", (req, res) => {
	res.json({ data: "respond received from the server!" });
});

// -------------------- API endpoint -------------------- //

// create account
app.post("/create-account", async (req, res) => {
	const { fullName, email, password } = req.body;

	if (!fullName) {
		return res.status(400).json({
			error: true,
			message: "Full Name is required",
		});
	}

	if (!email) {
		return res.status(400).json({
			error: true,
			message: "Email is required",
		});
	}

	if (!password) {
		return res.status(400).json({
			error: true,
			message: "Password is required",
		});
	}

	const isUser = await User.findOne({ email: email });

	if (isUser) {
		return res.status(400).json({
			error: true,
			message: "User already exist",
		});
	}

	const user = new User({
		fullName,
		email,
		password,
	});

	await user.save();

	const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "36000m", // ~25days
	});

	return res.json({
		error: false,
		message: "Registration Successful",
		user,
		accessToken,
	});
});

// login
app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email) {
		return res.status(400).json({
			error: true,
			message: "Email is required",
		});
	}

	if (!password) {
		return res.status(400).json({
			error: true,
			message: "Password is required",
		});
	}

	const userInfo = await User.findOne({ email: email });

	if (!userInfo) {
		return res.status(404).json({
			error: true,
			message: "User not found",
		});
	}

	if (userInfo.email == email && userInfo.password == password) {
		const user = { user: userInfo };
		const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "36000m", // ~25days
		});

		return res.json({
			error: false,
			message: "Login Successful",
			email,
			accessToken,
		});
	}

	return res.status(400).json({
		error: true,
		message: "Invalid Credentials",
	});
});

module.exports = app;
