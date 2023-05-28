import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redis from 'redis';
import dbConnect from './database/conn.js';
import userRouter from './router/user.js';


dotenv.config()
const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack


const port = process.env.PORT || 5000;

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});

// create a client connection
export const client = redis.createClient({
    // url: process.env.REDIS_URL
});

// on the connection
client.on("connect", () => console.log("Connected to Redis"));

await client.connect();


/** api routes */
app.use('/api/user', userRouter)

/** start server only when we have valid connection */
dbConnect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})

