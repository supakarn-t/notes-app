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

// get user
app.get("/user", authenticateToken, async (req, res) => {
	const { user } = req.user;

	const isUser = await User.findOne({ _id: user._id });

	if (!isUser) {
		return res.sendStatus(401);
	}

	return res.json({
		user: isUser,
		message: "",
	});
});

// add note
app.post("/add-note", authenticateToken, async (req, res) => {
	const { title, content, tags } = req.body;
	const { user } = req.user;

	if (!title) {
		return res.status(400).json({
			error: true,
			message: "Title is required",
		});
	}

	if (!content) {
		return res.status(400).json({
			error: true,
			message: "Content is required",
		});
	}

	try {
		const note = new Note({
			title,
			content,
			tag: tags || [],
			userId: user._id,
		});

		await note.save();

		return res.json({
			error: false,
			note,
			message: "Note added successfully",
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: "Internal Server Error",
		});
	}
});

module.exports = app;
