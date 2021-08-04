const RandExp = require("randexp");
const Big = require("big.js");

const precisionNumberRegex = /^([1-9]\d{0,16})(\.\d{1,4})?$/;

for(let i = 0; i < 100000; i++) {
  const number = new RandExp(precisionNumberRegex).gen();
  try {
    Big(number)
  }
  catch(error) {
    console.log(number)
  }
}