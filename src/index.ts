import 'dotenv/config';
import './routers/cron'
import connects from './config/db';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { userRouter } from './routers/user';
import { departmentRouter } from './routers/department';
import { leaveRouter } from './routers/leave';
import { leaveManagementRouter } from './routers/leaveManagement';
import { projectRouter } from './routers/project';
import { worklogRouter } from './routers/worklog';
import { credentialRouter } from './routers/credential';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
connects()
// const corsOptions = { origin: '*' };
// app.use(express.static(path.join(__dirname, '/client/build'));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

// app.use(cors(corsOptions));
app.use(express.json());

app.use('/user', userRouter);
app.use('/department', departmentRouter);
app.use('/leaves', leaveRouter);
app.use('/leaveManagement', leaveManagementRouter);
app.use('/projects', projectRouter);
app.use('/worklog', worklogRouter);
app.use('/credential', credentialRouter);

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
});
