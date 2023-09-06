const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const users = {
  user: {
    email: "",
    password: "",
    id: ""
  }
};

const generateRandomString = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let idGen = "";

  for (let i = 0; i < 6; i++) {
    let randomID = Math.floor(Math.random() * char.length);
    idGen += char.charAt(randomID);
  }
  return idGen;
};

const generateUserID = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let idGen = "";

  for (let i = 0; i < 3; i++) {
    let randomID = Math.floor(Math.random() * char.length);
    idGen += char.charAt(randomID);
  }
  return idGen;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

// Register
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  const id = generateUserID();
  const { email, password } = req.body;
  users[id] = {id, email, password};
  res.cookie("user_id", users[id].id)
  res.redirect("/urls")
})

// Login
app.post("/login", (req, res) => {
  const { user } = req.body;
  res.cookie("user_id", user);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  const { user } = req.body;
  res.clearCookie("user_id", user);
  res.redirect("/urls");
})

// Add
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
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
    user: req.cookies["user_id"]
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
