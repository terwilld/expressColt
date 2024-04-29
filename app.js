const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const sleep = require('sleep')

const seedDB = require('./seeds/index.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users.js');




require('dotenv').config()
let dbURL = process.env.dbURL
// console.log(dbURL)

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}


//Comment out to connect to atlas
dbURL = 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbURL);
// mongoose.connect(dbURL);



// console.log('process ')
// console.log(process.env.MAPBOX_TOKEN)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected by mongoose")
})

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(mongoSanitize());
app.use(express.static(path.join(__dirname, 'public')))

// process.on('unhandledRejection', (reason, p) => {
//     console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
//     console.log(reason.stack)
//     // application specific logging, throwing an error, or other logic here
// });

// process.on('unhandledRejection', (reason, p) => {
//     console.error('Unhandled Rejection at:', p, 'reason:', reason);
// });

process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', promise, 'reason:', reason.stack || reason);
});


const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret:'thisismysecret'
    }
})


const sessionConfig = {
    name : 'myfancycoookiename',
    secret: 'thisisabadsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store:store
}
app.use(session(sessionConfig))
app.use(flash());

// app.use(helmet({contentSecurityPolicy: false}))
// app.use(helmet({}))


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drsimw1fc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.query)
    //    console.log("inside my custom middleware")
    // console.log(req.flash('success'))
    //console.log(req.session)
    res.locals.currentUser = req.user
    // console.log(res.locals.currentUser)
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


//  https://images.unsplash.com/photo-1433538534219-56b38a74c4c3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHwxOTA3Mjd8fHx8fHx8MTcxMjI0ODA4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1600



app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'terwilld@gmail.com', username: 'david' })
    const newUser = await User.register(user, 'david');
    console.log(newUser)
    res.send(newUser)

})


app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', function (req, res, next) {
    //  This is no longer needed because of the router 'mergeParams' option.  But I'm leaving
    //  it because this was my fun work around before 
    res.locals.campgroundId = req.params.id
    next();
}, reviewRoutes)
app.use('/', userRoutes)

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'))


app.get('/', (req, res) => {
    res.render('home.ejs')
    // res.send("In The Campgrounds index page")
})

app.get('/reseed', catchAsync(async (req, res, next) => {
    console.log("Derppre reseed")
    await seedDB();
    console.log("derp after re-seed")
    sleep.sleep(1);
    res.redirect('campgrounds')

    // res.
}))


app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    console.log("Whoops**********")
    console.log(err)
    const { statusCode = 404, message = 'Something Broke' } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong';
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log('app is running on 3000')
})