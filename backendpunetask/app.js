import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import transactionRouter from './routes/transaction.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// mongoose.connect(process.env.Mongo_url)
mongoose.connect('mongodb://localhost:27017/transactions')
    .then(() => {
        app.use('/transaction', transactionRouter);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log(error, 'Connection failed');
    });