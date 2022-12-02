const express = require("express");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");
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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World! This is my first Express app!" };
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
  const templateVars = { user: users[userID], urls: urlsForUser(userID, urlDatabase) };
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

app.delete("/urls/:id/", (req, res) => {
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

app.put("/urls/:id", (req, res) => {
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
  if (!req.body.longURL) {
    res.send('You must enter a link to shorten.');
  }
  urlDatabase[randomID] = { longURL: req.body.longURL, userID };
  userID ? res.redirect(`/urls/${randomID}`) : res.send('You must log in to register a new website.');
});

app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  if (userID) {
    if (bcrypt.compareSync(req.body.password, users[userID].password)) {
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
  if (!email || !password || getUserByEmail(email, users)) {
    res.status(400).send('Registration failed.');
  }
  users[randomID] = { id: randomID, email, password: bcrypt.hashSync(password, 10) };
  req.session.user_id = randomID;
  console.log(users);
  res.redirect("/urls");
});