/******************
 == Challenge 4 ==
 Create a function that logs the error code "10293" if isDevelopment is set to true.
 If isDevelopment is set to false, no error code should be printed.
 While you cannot change any of the code outside of the START and END comments,
 you can switch the value of isDevelopment to test your code.
 *******************/
const isDevelopment = true;

// START - Add your code after this comment.

function showError(isDevelopment) {
    if (isDevelopment) {
        return " Error code 10293";
    } else {
        return "";
    }
}

// END - Don't type beyond this comment.

let error = showError(isDevelopment);
console.log(`Unfortunately. Something went wrong.${error}`);