/******************
 == Challenge 5 ==
 Put together everything you have learnt in these challenges to do the following:

 (1) Create a taxi rank system that accepts three variables (miles, initialCharge, chargePerMile).
 (2) The miles should be set to 25. This represents the length of the journey.
 (3) The initialCharge is 2.50. This is the initial charge applied to all journeys and includes the first mile.
 (4) The chargePerMile is 1.50. This is the amount the taxi charges for each mile after the first mile.

 You should use a function and output your result using template literals.

 REMEMBER: The first mile is included in the initial charge of 2.50!
 *******************/

// START - Add your code after this comment.

let miles = 25;
let initialCharge = 2.50;
let chargePerMile = 1.50;

function calculateTaxiCharge(miles, initialCharge, chargePerMile) {
    return initialCharge + (miles - 1) * chargePerMile;
}

console.log(`The taxi charge for ${miles} miles is ${calculateTaxiCharge(miles, initialCharge, chargePerMile)}`);

// END - Don't type beyond this comment.