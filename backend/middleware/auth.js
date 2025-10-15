const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get the token from the 'Authorization' header
  const authHeader = req.header("Authorization");

  // Check if token exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // The token is expected in the format "Bearer <token>"
    // We split the string and take the second part
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token format is invalid" });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's information (payload) to the request object
    req.user = decoded;
    
    // Continue to the next function (the route handler)
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};