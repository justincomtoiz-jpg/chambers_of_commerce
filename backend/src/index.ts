import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { AppDataSource } from './ormconfig';
import preAppRoutes from './routes/preApplications';
import formalRoutes from './routes/formalReviews';
import boardRoutes from './routes/board';
import commissionerRoutes from './routes/commissioner';
import inspectionsRoutes from './routes/inspections';
import businessesRoutes from './routes/businesses';
import eventsRoutes from './routes/events';
import pdRoutes from './routes/pdRequests';
import delinquencyRoutes from './routes/delinquency';
import logsRoutes from './routes/logs';
import streetsRoutes from './routes/streets';
import path from 'path';
import { seed } from './services/seedStreets';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' },
});

// attach io to app locals so routes/services can access it
app.set('io', io);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api/pre-applications', preAppRoutes);
app.use('/api/formal-reviews', formalRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/commissioner', commissionerRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/pd-requests', pdRoutes);
app.use('/api/delinquency', delinquencyRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/streets', streetsRoutes);

// Serve static frontend build if present
app.use('/', express.static(path.join(__dirname, '../../frontend/dist')));

const PORT = Number(process.env.PORT || 3001);

AppDataSource.initialize()
  .then(async () => {
    console.log('DB connected');
    await seed();

    io.on('connection', (socket) => {
      console.log('Socket connected', socket.id);
      socket.on('join', (room) => {
        socket.join(room);
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
      });
    });

    server.listen(PORT, () => console.log(`Server listening ${PORT}`));
  })
  .catch((err) => {
    console.error('DB init error', err);
  });
