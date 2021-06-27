import mongoose, { Schema } from 'mongoose';

const { Types } = Schema;

const tasksSchema = new mongoose.Schema({
    title: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true,
        index: true,
    },
    description: {
        type: String,
        minLength: 0,
        maxLength: 4000,
        default: null,
    },
    date_time: {
        type: Date,
        default: null,
        index: true,
    },
    notification: {
        type: Number,
        default: 0,
    },
    is_scheduled: {
        type: Boolean,
        default: false,
        index: true,
    },
    task_list_id: {
        type: String,
        default: null,
        index: true,
    },
    owner_id: {
        type: Number,
        required: true,
        index: true,
    },
    starred: {
        type: Boolean,
        default: false,
        index: true,
    },
    done: {
        type: Boolean,
        default: false,
        index: true,
    },
    recurrence_interval: {
        type: Number,
        default: null,
    },
    recurrence_type: {
        type: String,
        enum: [null, 'DAY', 'WEEK', 'MONTH', 'YEAR'],
        default: null,
    },
    recurrence_done: {
        type: Boolean,
        default: false,
    },
    created_by_task_id: {
        type: Types.ObjectId,
        ref: 'Task',
        default: null,
    },
    deleted_at: {
        type: Date,
        default: null,
        index: true,
    },
}, {
    autoCreate: true,
    autoIndex: true,
});

const Task = mongoose.model('Task', tasksSchema);

export const models = {
    Task
};

export const startMongo = async () => {
    await mongoose.connect('mongodb://localhost:27017/task-manager?authSource=admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        auth: {
            user: 'mongo',
            password: 'mongo'
        }
    });
};
