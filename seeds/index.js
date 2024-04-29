
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const axios = require('axios')
const cloudinary = require('cloudinary').v2
const cities = require('./cities.js');
//console.log(cities)
const { places, descriptors } = require('./seedHelpers.js')

const User = require('../models/user')
const multer = require('multer')

require('dotenv').config()
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

// const { cloudinary, storage } = require('../cloudinary')
// const upload = multer({ storage })

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected derp");
});

// axios.get('https://source.unsplash.com/collection/190727/1600x900')
//     .then(function (response) {
//         console.log(response.request.res.responseUrl);
//     }).catch(function (no200) {
//         console.error("404, 400, and other events");

//     });

const arrOfUsers = async () => {
    console.log('testing does this function get called ')
    const returnedUsers = await User.find({}).select({ "_id": 1 })
    const myUsers = []
    for (let person of returnedUsers) {
        myUsers.push(person._id)
    }
    // console.log(myUsers)
    return myUsers

}

const getCurrentCloudinarySeedImages = async () => {
    // console.log('test   12345')
    // console.log(cloudinary)
    // cloudinary.api.resources_by_asset_folder("Yelpcamp", function (error, result) { console.log(result, error); });
    // console.log(cloudinary.api.resources_by_asset_folder)
    result = await cloudinary.api.resources({ type: "upload", prefix: "yelpcamp/Seedimages" },
        (error, result) => {
            // console.log(result,error);
            // console.log(result.resources)
        });
    const urlResults = []
    result.resources.forEach((el) => {
        // console.log(el)
        urlResults.push({ 'url': el.secure_url, 'filename': el.public_id })
    })
    // console.log(urlResults)
    return urlResults
}

// console.log('derp I am in the seeds folder')

//getCurrentCloudinarySeedImages()



const seedDB = async () => {
    const result = await Campground.deleteMany({});
    // const c = new Campground({ title: 'my backyard' });
    // await c.save();
    console.log('deleted all current campgrounds')

    myUsers = await arrOfUsers()
    // console.log('second arr of myUsers')
    // console.log(myUsers)


    const seedUrls = await getCurrentCloudinarySeedImages()
    // console.log('test')
    // console.log(seedUrls)


    for (let i = 0; i < 50; i++) {

        const user = myUsers[Math.floor(Math.random() * myUsers.length)];
        const random1000 = Math.floor((Math.random() * 1000))
        const randDescription = descriptors[Math.floor(Math.random() * descriptors.length)]
        const randLocation = places[Math.floor(Math.random() * places.length)]
        const randPrice = Math.floor(Math.random() * 30)
        // let dynamicURL
        const randCity = cities[random1000].city +' ' + cities[random1000].state
        if (i % 10 === 0) {
            console.log(`Random location is ${randCity}`)
        }

        // const geodata = await geocoder.forwardGeocode({
        //     query: randCity,
        //     limit: 1
        // }).send()
        // [ Long , Lat ]
        // console.log(geodata.body.features[0].geometry)
        // await axios.get('https://source.unsplash.com/collection/190727/1600x900')
        //     .then(function (response) {
        //         dynamicURL = response.request.res.responseUrl
        //         //console.log(response.request.res.responseUrl);
        //     }).catch(function (no200) {
        //         console.error("404, 400, and other events");
        //     });
        // latitude: 34.0522342,
        //     longitude: -118.2436849,

        // console.log(randPrice)
        const newCampground = new Campground({
            title: `${randDescription} ${randLocation}`,
            price: randPrice,
            description: `${randDescription} ${randLocation} in ${cities[random1000].state} is a pleasant place for all families`,
            location: randCity,
            // geometry: geodata.body.features[0].geometry,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            // image: dynamicURL,
            author: user
        });

        // console.log(newCampground)
        var item = seedUrls[Math.floor(Math.random() * seedUrls.length)];
        newCampground.images.push({ filename: item.filename, url: item.url })
        item = seedUrls[Math.floor(Math.random() * seedUrls.length)];
        newCampground.images.push({ filename: item.filename, url: item.url })
        item = seedUrls[Math.floor(Math.random() * seedUrls.length)];
        newCampground.images.push({ filename: item.filename, url: item.url })
        // console.log(newCampground);
        await newCampground.save();
        // console.log(i)
    }

    console.log("All done seeding")

}
// console.log(seedHelpers)



//seedDB()
// .then(() => {
//     console.log("About to close mongoose");
//     mongoose.connection.close();
//     console.log("Closed Mongoose")
// })
//console.log(places)
//console.log(descriptors)

module.exports = seedDB