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
  return String(result);
};

// function to search user by email address from database
const getUserByEmail = (email, database) => {
  // iterate through all user objects in database
  for (const user of Object.values(database)) {
    // iterate through all key, value pairs in each user
    for (const [key, value] of Object.entries(user)) {
      // if key is email and its value is the same as the argument
      if (key === "email" && value === email) {
        // return the id of the user
        return user.id;
      }
    }
  }
  return null;
};

// function to find user registered URLs
const urlsForUser = (id, database) => {
  // create an object variable to hold result as in urlDatabase
  const result = {};
  // iterate through all key, value pairs of URL entries
  for (const [key, value] of Object.entries(database)) {
    // if the userID property has the same value as the id argument,
    if (value.userID === id) {
      // add the tinyURL key and longURL value to the result object
      result[key] = { longURL: value.longURL };
    }
  }
  return result;
};


module.exports = { generateRandomString, getUserByEmail, urlsForUser };