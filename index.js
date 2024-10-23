import express from 'express';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

//Imports
import { PORT, SECRET_JWT_KEY } from './config.js';
import { UserRepository } from './user-repository.js';


const app = express();

// Using Middleware to parse request body to JSON
app.use(express.json());

//Using middleware to parse the cookies
app.use(cookieParser());

//Create middleware to indentify if petition contains a cookie
app.use((req, res, next) => {

    const token = req.cookies.access_token


    //Initally start the session as null
    req.session = { user: null }

    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = data
    } catch { }

    next() //Continue with the route of middlewares
})

//Using view engine ejs for html responses
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/register', async (req, res) => {

    //1. Recover username and password
    const { username, password } = req.body;

    try {
        //2. Store and send user id
        const id = await UserRepository.create({ username, password });

        res.send({ id })
    } catch (error) {
        //responde with 400 status and the error message

        res.status(400).send({ error: error.message });
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await UserRepository.login({ username, password })

        console.log(user)

        //Create the JSON session token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_JWT_KEY,
            {
                expiresIn: '1h'
            })

        //Emit response with cookie and then actual response
        res
            .cookie('access_token', token, {
                httpOnly: true, //Cookie is only accesibale in the server
                secure: process.env.NODE_ENV === 'production', //Cookie is only accessible in https
                sameSite: 'strict', //Only accessible from the same domain
                maxAge: 1000 * 60 * 60 // Cookie only lasts for one hour
            })
            .send({ user })
    } catch (error) {
        res.status(401).send({ error: error.message })
    }

})

app.get('/protected', (req, res) => {

    //Recover access token from requesst
    const { user } = req.session
    if (!user) return res.status(403).send('Access not authorized')

    res.render('protected', user)

})

app.post('/logout', (req, res) => {
    res
    .clearCookie('acess_token')
    .json({message: 'Logout sucessful'})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})