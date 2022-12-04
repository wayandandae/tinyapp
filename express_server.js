// node express framework
const express = require("express");
// library module for password encryption
const bcrypt = require("bcryptjs");
// middlewares
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
// database/helper imports
const { PORT, urlDatabase, users } = require("./database");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");

const app = express();
// set extended javascript as template engine
app.set("view engine", "ejs");

// middlewares (*listing them at the end returns errors...)
// middleware to parse url-encoded data
app.use(express.urlencoded({ extended: true }));
// middleware to use static files from all folders
app.use(express.static('.'));
// method-override middleware for PUT/DELETE methods
app.use(methodOverride('_method'));
// cookie-session middleware for cookie encryption
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.get("/", (req, res) => {
  // ID retrieved from cookie object's user_id value
  const cookieID = req.session.user_id;
  // use user_id from the cookie as template variable
  const templateVars = { user: users[cookieID] };
  // render the main page with the user object from the database
  res.render("main", templateVars);
});

// page to create a new TinyUrl
app.get("/urls/new", (req, res) => {
  const cookieID = req.session.user_id;
  const templateVars = { user: users[cookieID] };
  // if cookie of user_id does not exist (user has not logged in),
  if (!cookieID) {
    // prompt user to log in
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// page to edit a created link
app.get("/urls/:id", (req, res) => {
  const cookieID = req.session.user_id;
  const requestID = req.params.id;
  // if URL ID is not found in the database,
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  } else if (!cookieID) {
    res.send('You must log in to view this website.');
    // if user ID from cookie does not match the owner of saved URL
  } else if (cookieID !== urlDatabase[requestID].userID) {
    res.send('You do not have permission to view this website.');
  } else {
    const templateVars = { user: users[cookieID], id: requestID, longURL: urlDatabase[requestID].longURL };
    res.render("urls_show", templateVars);
  }
});

// page to show JSON object of user URLs
app.get("/urls.json", (req, res) => {
  const cookieID = req.session.user_id;
  // users can only see URLs they own
  const urlsToShow = urlsForUser(cookieID, urlDatabase);
  res.json(urlsToShow);
});

// page to show all owned URLs with edit and delete buttons
app.get("/urls", (req, res) => {
  const cookieID = req.session.user_id;
  // only owned URLs returned by urlsForUser helper will be passed
  const templateVars = { user: users[cookieID], urls: urlsForUser(cookieID, urlDatabase) };
  if (!cookieID) {
    res.send("You must log in to view the websites.");
  } else {
    res.render("urls_index", templateVars);
  }
});

// path to redirect to the website with a corresponding TinyURL
app.get("/u/:id", (req, res) => {
  const requestID = req.params.id;
  const header = "http";
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  } else {
    let longURL = urlDatabase[requestID].longURL;
    // if longURL does not start with http, add proper header for routing
    if (longURL.slice(0, 4) !== header) {
      longURL = header + "://" + longURL;
    }
    res.redirect(longURL);
  }
});

// user registration page
app.get("/register", (req, res) => {
  const cookieID = req.session.user_id;
  const templateVars = { user: users[cookieID] };
  // if user is not logged in in the registration page,
  if (!cookieID) {
    // render with template variable required for the _header template
    res.render("user_registration", templateVars);
    // if user has logged in and visited this page, redirect to /urls
  } else {
    res.redirect("/urls");
  }
});

// user login page
app.get("/login", (req, res) => {
  const cookieID = req.session.user_id;
  const templateVars = { user: users[cookieID] };
  if (!cookieID) {
    res.render("user_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// PUT(edit) method for saved URLs
app.put("/urls/:id", (req, res) => {
  const cookieID = req.session.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  } else if (!cookieID) {
    res.send('You must log in to edit this link.');
    // if user_id from cookie does not matach URL owner's ID,
  } else if (cookieID !== urlDatabase[requestID].userID) {
    res.send('You must own the link to edit it.');
  } else {
    // selected longURL is reassigned the new input value
    urlDatabase[requestID].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

// delete a created TinyURL from the database
app.delete("/urls/:id/", (req, res) => {
  const cookieID = req.session.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send(`TinyURL ${requestID} does not exist in our database.`);
  } else if (!cookieID) {
    res.send('You must log in to delete this link.');
  } else if (cookieID !== urlDatabase[requestID].userID) {
    res.send('You must own the link to delete it.');
  } else {
    // selected TinyURL value is removed from urlDatabase object
    delete urlDatabase[requestID];
    res.redirect("/urls");
  }
});

// create a new TinyURL link with the user string input
app.post("/urls", (req, res) => {
  const cookieID = req.session.user_id;
  // create a random alphanumeric string ID
  const randomID = generateRandomString();
  // if user did not provide a URL,
  if (!req.body.longURL) {
    res.send('You must enter a link to shorten.');
  } else if (!cookieID) {
    res.send('You must log in to register a new website.');
  } else {
    // add a new URL object to urlDatabase with userID for authentication
    urlDatabase[randomID] = { longURL: req.body.longURL, userID: cookieID };
    // redirect to the newly created page
    res.redirect(`/urls/${randomID}`);
  }
});

app.post("/register", (req, res) => {
  // email and password entered by user
  const email = req.body.email;
  const password = req.body.password;
  // if no email or password was passed by user,
  if (!email || !password) {
    res.status(400).send('You must provide email and password in order to register.');
    // if the email entered already exists in the database,
  } else if (getUserByEmail(email, users)) {
    res.status(400).send(`There is an existing account registered with ${email}.`);
  } else {
    const randomID = generateRandomString();
    // add the new user object with the password encrypted to users database
    users[randomID] = { id: randomID, email, password: bcrypt.hashSync(password, 10) };
    // set cookie's user_id as the created random ID
    req.session.user_id = randomID;
    console.log(users);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  // if email and password match the database,
  if (userID && bcrypt.compareSync(req.body.password, users[userID].password)) {
    // set cookie object's user_id as the ID found from database
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.status(403).send('Login credentials do not match our records.');
  }
});

app.post("/logout", (req, res) => {
  // clear current cookie session
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Jack's TinyApp listening on port ${PORT}!`);
});