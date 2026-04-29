/******************
 == Challenge 3 ==
 Below is the answer to the previous challenge.
 Convert this code so that it instead uses a function.
 The function should be named "convertAge" and it should accept two parameters (dogAge and multiplier)
 *******************/
const dogAge = 7;
const multiplier = 15;

// START - Add your code after this comment.

function convertAge(dogAge, multiplier) {
    return dogAge * multiplier;
}

// END - Don't type beyond this comment.

let dogHumanYears = convertAge(dogAge, multiplier);
console.log(`A dog that is ${dogAge} years old is aged ${dogHumanYears} in human years.`);