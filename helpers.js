
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

module.exports = { 
  getUserByEmail 
};