const axios = require('axios')


//https://source.unsplash.com/collection/190727/1600x900



axios.get('https://source.unsplash.com/collection/190727/1600x900')
    .then(function (response) {
        console.log(response.request.res.responseUrl);
    }).catch(function (no200) {
        console.error("404, 400, and other events");

    });


// axios.get('http://www.stackoverflow.com/questions/47444251/how-to-get-the-landing-page-url-after-redirections-using-axios').then(function (response) {
//     console.log(response.request.res.responseUrl);
// }).catch(function (no200) {
//     console.error("404, 400, and other events");

// });