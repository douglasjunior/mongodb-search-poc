import express from 'express';
import faker from 'faker';
import { models } from './mongoInstance';

const tasksRouter = express.Router();

const MAX_DATE = new Date(253402300799999);
const MONGO_DATE_FORMAT = '%Y-%m-%dT00:00:00.000Z';

const accentMap = [
    'aàáâãäå',
    'cç',
    'eèéêë',
    'iìíîï',
    'nñ',
    'oòóôõöø',
    'sß',
    'uùúûü',
    'yÿ',
];

const createRegex = text => {
    if (!text) return '';

    const regexValue = RegExp.escape(text.toLowerCase());
    
    let textFold = '';
    for (let char of regexValue) {
        const subst = accentMap.find(acc => acc.includes(char));
        textFold += subst ? `[${subst}]` : char;
    }

    console.log({ textFold });

    return textFold;
};

tasksRouter.get('/', async (req, res, next) => {
    const { search } = req.query;

    try {
        console.time('list-task');
        const tasks = await models.Task.find({
            owner_id: 1,
            deleted_at: null,
            title: {
                $regex: createRegex(search),
                $options: 'i'
            }
        });
        console.timeEnd('list-task');

        console.log('found: ' + tasks.length);

        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

tasksRouter.get('/aggregate', async (req, res, next) => {
    const { search } = req.query;

    try {
        console.time('list-task');
        const tasks = await models.Task.aggregate([
            {
                $match: {
                    owner_id: 1,
                    deleted_at: null,
                    title: {
                        $regex: createRegex(search),
                        $options: 'i'
                    }
                },
            },
            {
                $addFields: {
                    id: '$_id',
                    date_time: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$date_time', null] }, then: MAX_DATE },
                                { case: { $eq: ['$is_scheduled', true] }, then: '$date_time' },
                            ],
                            default: {
                                $dateFromString: {
                                    dateString: {
                                        $dateToString: {
                                            date: '$date_time',
                                            format: MONGO_DATE_FORMAT,
                                            timezone: '-0300',
                                        },
                                    },
                                    format: MONGO_DATE_FORMAT,
                                },
                            },
                        },
                    },
                },
            },
            { $sort: { date_time: 1 } },
            { $project: { _id: 0 } },
        ]);
        console.timeEnd('list-task');

        console.log('found: ' + tasks.length);

        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

tasksRouter.get('/create', async (req, res, next) => {
    try {
        const task = new models.Task({
            title: faker.hacker.phrase().substring(0, 200),
            description: faker.lorem.words(500).substring(0, 4000),
            date_time: new Date(),
            notification: faker.helpers.randomize([true, false]),
            is_scheduled: faker.helpers.randomize([true, false]),
            task_list_id: faker.helpers.randomize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            owner_id: faker.helpers.randomize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            starred: faker.helpers.randomize([true, false]),
            done: faker.helpers.randomize([true, false]),
            recurrence_interval: faker.helpers.randomize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            recurrence_type: faker.helpers.randomize([null, 'DAY', 'WEEK', 'MONTH', 'YEAR']),
            recurrence_done: faker.helpers.randomize([true, false]),
            deleted_at: faker.helpers.randomize([new Date(), new Date(), new Date(), new Date(), null]),
        })

        await task.save();

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

export default tasksRouter;
