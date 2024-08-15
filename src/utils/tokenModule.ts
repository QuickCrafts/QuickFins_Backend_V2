const jwt = require("jsonwebtoken");

export function isTokenExpired(token: string): boolean {
  try {
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      return true; // Invalid token
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp <= currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume expired if there's an error
  }
}

