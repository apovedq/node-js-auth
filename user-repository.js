import DBLocal from "db-local";
const {Schema} = new DBLocal({path: './db'});

//Using crypto to hash the password before storing it in the db
import bcrypt from 'bcrypt';

//Salt round refers the to the amount of times the item to encrypt will be encrypted
import {SALT_ROUNDS} from './config.js'

const User = Schema('User', {
    _id: {type:String, required:true},
    username: {type:String, required:true},
    password: {type:String, required:true}
})

export class UserRepository {

    // This is a static method, so it can be called without creating an instance of the class
    static async create({username, password}) {
        
        //1. username validaton
        if (typeof username !== 'string') {
            throw new Error('Username must be a string');
        }

        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }

        //2. password validation
        if (typeof password !== 'string' ) {
            throw new Error('Password must be a string');
        }

        if (password.length < 3) {
            throw new Error('Password must be at least 3 characters long');
        }

        //3. Make sure it does not exist in the db
        const user = User.findOne({username});
        if (user) throw new Error('User already exists');

        //4. Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        //5. Create id
        const id = crypto.randomUUID();

        //6. Create user
        User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save()

        return id;
    }
}