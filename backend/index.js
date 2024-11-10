import express from 'express';
import cors from 'cors';
import { port } from './config.js';
import { routes } from './routes/location-routes.js';

const app = express();

app.use(express.json());  // Use express.json() for JSON parsing
app.use(cors());

app.use('/api', routes);

app.listen(port, () => console.log('App is listening on url http://localhost:' + port));
