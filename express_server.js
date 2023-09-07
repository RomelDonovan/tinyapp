const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const { urlDatabase, users, generateRandomString, getUserByEmail, urlsForUser } = require("./helper")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// Homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }
  
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Register
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id]
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email or Password invalid");
  }
  if (getUserByEmail(users, email)) {
    return res.status(400).send("Email already exists");
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");
})

// Login
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    return res.redirect("/url");
  }
  const templateVars = { user };
  res.render("urls_login", templateVars);
})
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email)
  if (!user) {
    return res.status(403).send("Email invalid");
  }
  if (!email && !password) {
    return res.redirect("/login")
  }
  if (user.password !== password) {
    return res.status(403).send("Incorrect Password")
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  const { user } = req.body;
  res.clearCookie("user_id", user);
  res.redirect("/login");
})

// Add
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    return res.send("Error: Empty request");
  }
  const id = generateRandomString();
  const userId = req.cookies["user_id"]; // Get the user's ID from the cookie
  urlDatabase[id] = { longURL: req.body.longURL, user: userId }; // Store the user's ID along with the URL
  res.redirect(`/urls`);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    return res.send("Please login to access short url");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// Edit
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { updatedURL } = req.body;
  const userId = req.cookies["user_id"];
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }
  if (!userId) {
    return res.status(403).send("Please log in to edit the URL");
  }
  if (urlDatabase[id].user !== userId) {
    return res.status(403).send("You do not own this URL");
  }
  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const userId = req.cookies["user_id"];
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }
  if (!userId) {
    return res.status(403).send("Please log in to delete the URL");
  }
  if (urlDatabase[id].user !== userId) {
    return res.status(403).send("You do not own this URL");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//---------------------------------------------------
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
