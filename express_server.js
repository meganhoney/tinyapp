const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// FUNCTIONS AND OBJECTS

const generateRandomString = function() {
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrsthvwxyz1234567890"

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const getUserByEmail = function(database, email) {
  let user = {};

  for (let key in database) {
    if (database[key]['email'] === email) {
      user = database[key];

      return user;
    }
  }

  return null;
  
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


// GET REQUESTS

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[`user${req.cookies["user_id"]}`] };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[`user${req.cookies["user_id"]}`] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[`user${req.cookies["user_id"]}`] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// POST REQUESTS

// Create new shortURL - redirect to page with that new url
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect("/urls/" + newShortURL);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    res.status(400).send("Please input a valid email and password");
  }

  // if getUserByEmail returns null, register user
  if (!getUserByEmail(users, email)) {
    const userID = generateRandomString();
    users[`user${userID}`] = { userID, email, password };
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
  
  res.status(400).send("There is already a user with that email");
  
});

// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");

// });

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
  res.redirect("/urls/:id");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// What would happen if a client requests a short URL with a non-existant id?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});