export function pbkdf2(password, salt, iterations, keylen, digest) {
  return window.crypto.subtle
  .importKey("raw", stringToArrayBuffer(password), "PBKDF2", false, [
    "deriveKey",
  ])
  .then((key) => {
    const algo = {
      name: "PBKDF2",
      salt: stringToArrayBuffer(salt),
      iterations,
      hash: getAlgorithm(digest),
    };
    return window.crypto.subtle.deriveKey(
      algo,
      key,
      {
        name: "AES-CTR",
        length: keylen * 8,
      },
      true,
      ["encrypt", "decrypt"]
    );
  })
  .then((derivedKey) =>
    window.crypto.subtle
      .exportKey("raw", derivedKey)
      .then((keyArray) => arrayBufferToHex(keyArray))
  );
};

function getAlgorithm(algorithm) {
  const algorithms = {
    sha1: "SHA-1",
    "sha-1": "SHA-1",
    sha256: "SHA-256",
    "sha-256": "SHA-256",
    sha512: "SHA-512",
    "sha-512": "SHA-512"
  };
  const lowercaseAlgorithm = algorithm.toLowerCase();
  if (lowercaseAlgorithm in algorithms) {
    return algorithms[lowercaseAlgorithm];
  }
  return "SHA-256";
}

function stringToArrayBuffer(s) {
  const base64String = unescape(encodeURIComponent(s));
  const charList = base64String.split("");
  const arrayBuffer = [];
  for (let i = 0; i < charList.length; i += 1) {
    arrayBuffer.push(charList[i].charCodeAt(0));
  }
  return new Uint8Array(arrayBuffer);
}
  
export function arrayBufferToHex(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  let str = "";
  for (let i = 0; i < byteArray.byteLength; i += 1) {
    str += byteArray[i].toString(16).padStart(2, "0");
  }
  return str;
}
