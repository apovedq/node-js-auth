import express from 'express';
import { PORT } from './config.js';
import { UserRepository } from './user-repository.js';

const app = express();
// Using Middleware to parse request body to JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/register', async (req, res) => {

    //1. Recover username and password
    const {username, password} = req.body;

    try {
        //2. Store and send user id
        const id = await UserRepository.create({username, password});
    
        res.send({id})
    } catch (error) {
        //responde with 400 status and the error message
   
        res.status(400).send({error: error.message});
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})