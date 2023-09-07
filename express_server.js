const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const { urlDatabase, users, generateRandomString, generateUserID, getUserByEmail } = require("./helper")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// Homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Register
app.get("/register", (req, res) => {

  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(400).send("Email or Password invalid");
  }
  if (getUserByEmail(users, email)) {
    return res.status(400).send("Email already exists");
  }
  const id = generateUserID();
  users[id] = {id, email, password};
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");
})

// Login
app.get("/login", (req, res) => {
  res.render("urls_login");
})
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("user_id", username);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  const { username } = req.body;
  res.clearCookie("user_id", username);
  res.redirect("/urls");
})

// Add
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/urls/:id", (req, res) => {
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
  urlDatabase[id] = updatedURL;
  res.redirect("/urls");
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
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
