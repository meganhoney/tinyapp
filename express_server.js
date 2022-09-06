const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession( {
  name: "session",
  keys: ["shiitake"],
  maxAge: 24 * 60 * 60 * 1000
}));

// FUNCTIONS AND OBJECTS
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "b2xVn2",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  b2xVn2: {
    id: "b2xVn2",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// GET REQUESTS

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  // if user is not registered and logged in registration page will render
  if (!userID) {
    const templateVars = {
      user: null
    };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
  
})

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  // if user is not logged in login page will render
  if (!userID) {
    const templateVars = {
      user: null
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
  
})

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("You must be logged in to see this.");
  } else {
    const templateVars = { user: users[userID], urls: urlsForUser(userID, urlDatabase) };
    res.render("urls_index", templateVars);
  }
  
})

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if(!userID) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[userID] };
    res.render("urls_new", templateVars);
  }

});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if(!userID) {
    return res.status(401).send("You must be logged in to see this.");
  }
  const userURLs = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.id;
  
  if(Object.keys(userURLs).includes(shortURL)) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[userID] };
      res.render("urls_show", templateVars);
    } else {
      return res.status(401).send("You cannot access urls you have not created.");
  }
  
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL) {
    return res.status(404).send("We do not have a link that corresponds to that short URL at this time.");
  } else {
    res.redirect(longURL);
  }
  
});

// POST REQUESTS

// Create new shortURL - redirect to page with that new url
app.post("/urls", (req, res) => {
  // only registered users can add urls
  const userID = req.session.user_id;
  if(!userID) {
    return res.status(401).send("You must be logged in to create tiny URLs.\n");
  } else {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = { 
      longURL: req.body.longURL,
      userID: userID
    };
    console.log(urlDatabase);
    res.redirect("/urls/" + newShortURL);
  }
  
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    return res.status(400).send("Please input a valid email and password.");
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(400).send("Please input a valid email and password.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Incorrect password.");
  }

  req.session.user_id = user.userID;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  
  if (email === '' || password === '') {
    return res.status(400).send("Please input a valid email and password.");
  }

  if(getUserByEmail(users, email)) {
    return res.status(400).send("There is already a user with that email.");
  }
  const userID = generateRandomString();
  users[userID] = { userID, email, password };
  
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if(!Object.keys(urlDatabase).includes(shortURL)) {
    return res.status(404).send("We do not have this url in our database.\n")
  }
  if(!userID) {
    return res.status(401).send("You must be logged in to edit links.\n")
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not able to edit links you did not create.\n");
  }
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if(!Object.keys(urlDatabase).includes(shortURL)) {
    return res.status(404).send("We do not have this url in our database.\n")
  }
  if(!userID) {
    return res.status(401).send("You must be logged in to delete links.\n")
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not able to delete links you did not create.\n");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});