const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const char = "0123456789";
  let idGen = "";

  for (let i = 0; i < 3; i++) {
    let randomID = Math.floor(Math.random() * char.length);
    idGen += char.charAt(randomID);
  }
  return idGen;
};

const getUserByEmail = (users, email) => {
  const usersList = Object.values(users);

  const user = usersList.find((user) => email === user.email);

  return user;
};


module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  generateUserID,
  getUserByEmail
};