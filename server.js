import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './auth/route/user.route.js';
import swaggerDocs from './swagger.js';


dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
app.use('/api/users', userRoutes);

swaggerDocs(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});