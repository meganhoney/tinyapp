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

const urlsForUser = function(id, database) {
  let urls = {};

  for (let key in database) {
    if(database[key].userID === id) {
      urls[key] = database[key].longURL;
    }
  }
  return urls;
};

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
urlsForUser("aj481W", urlDatabase);
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  if (!userID) {
    res.status(401).send("You must be logged in to see this");
  } else {
    res.render("urls_index", templateVars);
  }
  //console.log(templateVars);
  
})

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if(!userID) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  }

});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]] };
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL) {
    res.status(404).send("We do not have a link that corresponds to that short URL at this time");
  } else {
    res.redirect(longURL);
  }
  
});


// POST REQUESTS

// Create new shortURL - redirect to page with that new url
app.post("/urls", (req, res) => {
  // only registered users can add urls
  const userID = req.cookies["user_id"];
  if(!userID) {
    res.status(401).send("You must be logged in to create tiny URLs\n");
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
    res.status(403).send('Please input a valid email and password');
  }
  const user = getUserByEmail(users, email);
  const userID = user.id;
  if (!user) {
    res.status(403).send('Please input a valid email and password');
  }

  if (password !== user.password) {
    res.status(403).send('Password incorrect');
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    return res.status(400).send("Please input a valid email and password");
  }

  if(getUserByEmail(users, email)) {
    return res.status(400).send("There is already a user with that email");
  }
  const userID = generateRandomString();
  users[userID] = { userID, email, password };
  
  res.cookie("user_id", userID);
  res.redirect("/urls");
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});