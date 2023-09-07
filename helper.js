const urlDatabase = {};

const users = {};

const generateRandomString = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let idGen = "";

  for (let i = 0; i < 6; i++) {
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

const urlsForUser = (id) => {
  let urls = {};
  for(const url in urlDatabase) {
    if (urlDatabase[url].user === id) {
      urls[url] = {...urlDatabase[url]};
    }
  }
  return urls;
};


module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  getUserByEmail,
  urlsForUser
};