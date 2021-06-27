import express from 'express';
import cors from 'cors';

import tasksRouter from './tasksRouter';
import { startMongo } from './mongoInstance';

const app = express();
app.use(cors());
app.use('/tasks', tasksRouter);

(async () => {
    try {
        await startMongo();

        app.listen(3000, () => {
            console.log('Listening...');
        });
    } catch (err) {
        console.error(err);
    }
})();

