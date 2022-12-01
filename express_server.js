const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// tinyURL-longURL database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.set("view engine", "ejs");
app.use(cookieParser());
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
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  res.render("user_login", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const randomID = generateRandomString();
  urlDatabase[randomID] = req.body.longURL;
  res.redirect(`/urls/${randomID}`);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
  res.status(403).send('Account credentials does not match our records.');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body.email || !req.body.password || getUserByEmail(req.body.email)) {
    res.status(400).send('Registration failed.');
  }
  users[randomID] = { id: randomID, email, password };
  res.cookie("user_id", randomID);
  console.log(users);
  res.redirect("/urls");
});