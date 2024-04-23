const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Initialize users as an array of user objects
let users = [
  {
    "username": "stephencurry",
    "password": "sc30hhhhhhhhh"
  }
];

console.log(users);

const isValid = (username) => {
    // Check if the username exists in the array of users
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Check if username and password match the ones in the array of users
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(401).json({ error: "Invalid username" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username }, "secret_key");

    // Save user credentials for the session as a JWT
    req.session.authorization = { accessToken };

    return res.status(200).json({ message: "User logged in successfully", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.user;

  if (!isbn || !review) {
      return res.status(400).json({ error: "ISBN and review are required" });
  }

  // Check if the book with the provided ISBN exists
  if (!books.hasOwnProperty(isbn)) {
      return res.status(404).json({ error: "Book not found" });
  }

  // Check if the user has already posted a review for the same ISBN
  if (books[isbn].reviews.hasOwnProperty(username)) {
      // If the user has already posted a review, modify it
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      // If the user has not posted a review for the same ISBN, add a new review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
  }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.user;

  // Check if the book with the provided ISBN exists
  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if the user has posted a review for the book
  if (!books[isbn].reviews.hasOwnProperty(username)) {
    return res.status(404).json({ error: "Review not found" });
  }

  // Delete the review associated with the user
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
