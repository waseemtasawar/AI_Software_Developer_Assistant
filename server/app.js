const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');


const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const fileRoutes = require('./routes/file.routes');
const analyzerRoutes = require('./routes/analyzer.routes');
const chunkRoutes = require('./routes/chunk.routes');
const queueRoutes = require('./routes/queue.routes');
const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});

app.use(limiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RepoMind Backend API is running",
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/analyzer', analyzerRoutes);
app.use('/api/v1/chunking', chunkRoutes);
app.use('/api/v1/queue', queueRoutes);



module.exports = app;