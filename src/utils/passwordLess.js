import { pbkdf2 } from './pbkdf2';
import bigInt from 'big-integer';

const characterSubsets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
};

function getSetOfCharacters(rules) {
    if (typeof rules === "undefined") {
      return (
        characterSubsets.lowercase +
        characterSubsets.uppercase +
        characterSubsets.digits +
        characterSubsets.symbols
      );
    }
    let setOfChars = "";
    rules.forEach(rule => {
      setOfChars += characterSubsets[rule];
    });
    return setOfChars;
}
  
function getOneCharPerRule(entropy, rules) {
    let oneCharPerRules = "";
    let consumedEntropy = entropy;
    rules.forEach(rule => {
      const password = consumeEntropy(
        "",
        consumedEntropy,
        characterSubsets[rule],
        1
      );
      oneCharPerRules += password.value;
      consumedEntropy = password.entropy;
    });
    return { value: oneCharPerRules, entropy: consumedEntropy };
}
  
function getRules(options) {
    return ["lowercase", "uppercase", "digits", "symbols"].filter(
      rule => options[rule]
    );
}
  
function insertStringPseudoRandomly(initialString, entropy, stringToInsert) {
    let consumedEntropy = entropy;
    let string = initialString;
    for (let i = 0; i < stringToInsert.length; i += 1) {
      const longDivision = consumedEntropy.divmod(string.length);
      string =
        string.slice(0, longDivision.remainder) +
        stringToInsert[i] +
        string.slice(longDivision.remainder);
      consumedEntropy = longDivision.quotient;
    }
    return string;
}

function consumeEntropy(
    generatedPassword,
    quotient,
    setOfCharacters,
    maxLength
  ) {
    let passwordBuilt = generatedPassword;
    if (passwordBuilt.length >= maxLength) {
      return { value: passwordBuilt, entropy: quotient };
    }
    const longDivision = quotient.divmod(setOfCharacters.length);
    passwordBuilt += setOfCharacters[longDivision.remainder];
    return consumeEntropy(
      passwordBuilt,
      longDivision.quotient,
      setOfCharacters,
      maxLength
    );
}

function renderPassword(entropy, options) {
    const rules = getRules(options);
    const setOfCharacters = getSetOfCharacters(rules);
    const generatedPassword = consumeEntropy(
      "",
      bigInt(entropy, 16),
      setOfCharacters,
      options.length - rules.length
    );
    const charactersToAdd = getOneCharPerRule(
      generatedPassword.entropy,
      rules
    );
    return insertStringPseudoRandomly(
      generatedPassword.value,
      charactersToAdd.entropy,
      charactersToAdd.value
    );
}

function calcEntropy (platform, login, increment = 1, masterPassword) {
    const salt = platform + login + increment.toString(16);
    const iterations = 100000;
    const keylen = 32;
    const digest  = 'sha256';

    return pbkdf2(masterPassword, salt, iterations, keylen, digest);
}

export function generatePassword (platform, login, password, profile) {
  return calcEntropy(platform, login, profile.counter, password).then(entropy => {
    return Promise.resolve(renderPassword(entropy, profile)); 
  });
}
