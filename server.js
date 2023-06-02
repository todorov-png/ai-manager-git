import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import morgan from 'morgan';
import cors from 'cors';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import cookieParser from 'cookie-parser';
import middleware from 'i18next-http-middleware';
import * as env from 'dotenv';
import clientRouter from './router/client.js';
import userRouter from './router/admin/user.js';
import roleRouter from './router/admin/role.js';
import integrationRouter from './router/integration.js';
import errorMiddleware from './middlewares/error-middleware.js';
import managerService from './service/manager-service.js';

env.config();
mongoose.set('strictQuery', false);

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}.json',
    },
  });

const PORT = process.env.PORT || 5000;
const app = express();

app.use(middleware.handle(i18next));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use('/api/integration', integrationRouter);
app.use('/api/user', userRouter);
app.use('/api/role', roleRouter);
app.use('/api', clientRouter);
app.use(errorMiddleware);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`[OK] Server is running on PORT = ${PORT}`);
    });

    await mongoose
      .connect(process.env.BD_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('[OK] DB is connected'))
      .catch(err => console.error(err));

    cron.schedule('59 59 23 * * *', async () => {
      console.log('cron')
      await managerService.runAllManager();
    });
  } catch (e) {
    console.log(e);
  }
};
start();
