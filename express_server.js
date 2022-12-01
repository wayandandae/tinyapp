const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

// tinyURL-longURL database object
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// object to hold users id, email, and password
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// function to create a 6-character alphanumeric string
const generateRandomString = () => {
  // create an array variable to hold all alphanumeric characters
  const charList = [];
  // uppercase alphabet charcode starts from 65
  const uppStart = 65;
  // lowercase alphabet charcode starts from 97
  const lowStart = 97;
  // create a variable to hold random alphanumeric value
  let result = "";

  // push numbers from 0 to 9
  for (let i = 0; i <= 9; i++) {
    charList.push(i);
  }
  // push uppercase and lowercase alphabets
  for (let j = 0; j < 26; j++) {
    charList.push(String.fromCharCode(uppStart + j));
    charList.push(String.fromCharCode(lowStart + j));
  }
  // add up to 6 random characters to the result string
  for (let k = 0; k < 6; k++) {
    result += charList[Math.floor(Math.random() * charList.length)];
  }
  return result;
};

// function to search user by email address
const getUserByEmail = mail => {
  // iterate through all user objects in users constant
  for (const user of Object.values(users)) {
    // iterate through all key, value pairs in each user
    for (const [key, value] of Object.entries(user)) {
      // if key is email and its value is the same as the argument
      if (key === "email" && value === mail) {
        // return the user object
        return user;
      }
    }
  }
  return null;
};

const urlsForUser = id => {
  const result = {};
  for (const [key, value] of Object.entries(urlDatabase)) {
    if (value.userID === id) {
      result[key] = { longURL: value.longURL };
    }
  }
  return result;
};

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  userID ? res.render("urls_new", templateVars) : res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const requestID = req.params.id;
  if (!userID) {
    res.send('You must log in to view this website.');
  }
  if (userID !== urlDatabase[requestID].userID) {
    res.send('You do not have permission to view this website.');
  }
  const templateVars = { user: users[userID], id: requestID, longURL: urlDatabase[requestID].longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID], urls: urlsForUser(userID) };
  userID ? res.render("urls_index", templateVars) : res.send("You must log in to view the websites.");
});

app.get("/u/:id", (req, res) => {
  if (Object.keys(urlDatabase).indexOf(req.params.id) < 0) {
    res.send(`TinyURL ${req.params.id} does not exist in our database.`);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  userID ? res.redirect("/urls") : res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  userID ? res.redirect("/urls") : res.render("user_login", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  }
  if (!userID) {
    res.send('You must log in to delete this link.');
  }
  if (userID !== urlDatabase[requestID].userID) {
    res.send('You must own the link to delete it.');
  }
  delete urlDatabase[requestID];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  }
  if (!userID) {
    res.send('You must log in to edit this link.');
  }
  if (userID !== urlDatabase[requestID].userID) {
    res.send('You must own the link to edit it.');
  }
  urlDatabase[requestID].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const randomID = generateRandomString();
  urlDatabase[randomID].longURL = req.body.longURL;
  userID ? res.redirect(`/urls/${randomID}`) : res.send('You must log in to register a new website.');
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = "user_id";
    res.redirect("/urls");
    }
  }
  res.status(403).send('Account credentials do not match our records.');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password || getUserByEmail(email)) {
    res.status(400).send('Registration failed.');
  }
  users[randomID] = { id: randomID, email, password: bcrypt.hashSync(password, 10) };
  req.session.user_id = randomID;
  console.log(users);
  res.redirect("/urls");
});