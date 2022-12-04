// function to create a 6-character alphanumeric string
const generateRandomString = () => {
  const charList = [];
  // uppercase alphabet charcode starts from 65
  const uppStart = 65;
  // lowercase alphabet charcode starts from 97
  const lowStart = 97;
  let result = "";

  for (let i = 0; i <= 9; i++) {
    charList.push(i);
  }
  for (let j = 0; j < 26; j++) {
    charList.push(String.fromCharCode(uppStart + j));
    charList.push(String.fromCharCode(lowStart + j));
  }
  for (let k = 0; k < 6; k++) {
    result += charList[Math.floor(Math.random() * charList.length)];
  }
  // return as string for uniformity
  return String(result);
};

// function to search user by email address from database
const getUserByEmail = (email, database) => {
  // iterate through all users of database argument
  for (const user of Object.values(database)) {
    for (const [key, value] of Object.entries(user)) {
      if (key === "email" && value === email) {
        // return the id of the user if the email addresses match
        return user.id;
      }
    }
  }
  return null;
};

// function to find user registered URLs
const urlsForUser = (id, database) => {
  const result = {};
  // iterate through all key, value pairs of URL entries
  for (const [key, value] of Object.entries(database)) {
    if (value.userID === id) {
      // add the tinyURL key and longURL value if the ids match
      result[key] = { longURL: value.longURL };
    }
  }
  return result;
};


module.exports = { generateRandomString, getUserByEmail, urlsForUser };