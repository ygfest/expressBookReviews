const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const axios = require('axios');
const { promisify } = require('util');
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

// Register New User
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (users.hasOwnProperty(username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  users[username] = password;

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/books');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book list" });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books.hasOwnProperty(isbn)) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// Get book details based on author using Async-Await with Axios
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get(`https://api.example.com/books?author=${author}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

// Get all books based on title using Promise callbacks
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  const filteredBooks = Object.values(books).filter(book => book.title === title);

  if (filteredBooks.length > 0) {
    res.json(filteredBooks);
  } else {
    res.status(404).json({ error: 'Books not found' });
  }
});

module.exports.general = public_users;
