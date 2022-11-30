const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  // create an array variable to hold all alphanumeric characters
  const charList = [];
  // uppercase alphabet charcode starts from 65
  const uppStart = 65;
  // lowercase alphabet charcode starts from 97
  const lowStart = 97;

  // push numbers from 0 to 9
  for (let i = 0; i <= 9; i++) {
    charList.push(i);
  }
  // push uppercase and lowercase alphabets
  for (let j = 0; j < 26; j++) {
    charList.push(String.fromCharCode(uppStart + j));
    charList.push(String.fromCharCode(lowStart + j));
  }

  // return character of a random index from 0 to charList length (not inclusive)
  return charList[Math.floor(Math.random() * charList.length)];
};

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
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});