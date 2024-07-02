const jwt = require("jsonwebtoken");

// middleware function
function authenticateToken(req, res, next) {
	// authorization header
	// req.header -> authorization: Bearer <JWT token>
	const authHeader = req.headers["authorization"];
	// console.log(req);

	// check if authHeader exists, and save authHeader.split(" ")[1] into token
	const token = authHeader && authHeader.split(" ")[1];

	// console.log(`access token: ${token}`);

	if (!token) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(401);
		// console.log(user);
		req.user = user;
		next();
	});
}

module.exports = { authenticateToken };
