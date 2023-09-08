const express = require("express");
const sessionession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { generateRandomString, getUserByEmail } = require("./helpers");
const { urlDatabase, users } = require("./data")

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(sessionession({
  name: 'session',
  keys: ["key1"],
}));

/* Homepage ("/") */
app.get("/", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) return res.redirect("/login");
});

/* This page displays a list of URLs */
app.get("/urls", (req, res) => {

  //Users must be logged in to access this page
  if (!req.session.user_id) return res.status(403).send("Only Logged in users can view shorten URLs");
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

/* Register */
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) return res.redirect("/urls");

  const templateVars = { user };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email or Password invalid");
  if (getUserByEmail(users, email)) return res.status(400).send("Email already exists");

  const id = generateRandomString();
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
  req.session["user_id"] = users[id].id;
  res.redirect("/urls");
});

/* Login */
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) return res.redirect("/url");

  const templateVars = { user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);
  if (!user) return res.status(403).send("Email invalid");
  if (!email && !password) return res.redirect("/login");
  if (!bcrypt.compareSync(password, user.password)) return res.status(403).send("Incorrect Password");

  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

/* Logout */
app.post("/logout", (req, res) => {
  const { user } = req.body;
  res.clearCookie("session", user);
  res.redirect("/login");
});

/* Add */
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) return res.redirect("/login");

  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.body.longURL) return res.send("Error: Empty request");

  const id = generateRandomString();
  const userId = req.session["user_id"]; // Get the user's ID from the cookie
  urlDatabase[id] = { longURL: req.body.longURL, user: userId }; // Store the user's ID along with the URL
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send("URL does not exist in database")
  if (!users[req.session.user_id]) return res.status(400).send("Please login to access short url");
  if (urlDatabase[req.params.id].user !== req.session["user_id"]) return res.status(403).send("You can not view URLs you dont own");

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) return res.status(404).send("URL does not exists in database");

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Edit
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { updatedURL } = req.body;
  const userId = req.session["user_id"];

  if (!urlDatabase[id]) return res.status(404).send("URL not found");
  if (!userId) return res.status(403).send("Please log in to edit the URL");
  if (urlDatabase[id].user !== userId) return res.status(403).send("You do not own this URL");

  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const userId = req.session["user_id"];

  if (!urlDatabase[id]) return res.status(404).send("URL not found");
  if (!userId) return res.status(403).send("Please log in to delete the URL");
  if (urlDatabase[id].user !== userId) return res.status(403).send("You do not own this URL");

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});