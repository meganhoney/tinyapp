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

module.exports = { 
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};