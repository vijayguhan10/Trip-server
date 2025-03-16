const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const superAdmin = require('./routes/superAdminRoutes');
const authenticate = require('./routes/userRoutes');
const agent = require('./routes/agentRoutes');
const location = require('./routes/locationRoutes');
const booking = require('./routes/bookingRoutes');
const thingsToCarry = require('./routes/thingsToCarryRoutes');
const destination = require('./routes/destinationRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const restaurant = require('./routes/restaurantRoutes');
const shop = require('./routes/shopRoutes');
const activity = require('./routes/activityRoutes');
const dish = require('./routes/dishRoutes');
const product = require('./routes/productRoutes');
const task = require('./routes/taskRoutes');
const review = require('./routes/reviewRoutes');
const reservation = require('./routes/reservationRoutes');

app.use('/api/superadmin', superAdmin);
app.use('/api/auth', authenticate);
app.use('/api/agent', agent);
app.use('/api/booking', booking);
app.use('/api/location', location);
app.use('/api/things-to-carry', thingsToCarry);
app.use('/api/destination', destination);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/restaurant', restaurant);
app.use('/api/shop', shop);
app.use('/api/activities', activity);
app.use('/api/dish', dish);
app.use('/api/product', product);
app.use('/api/task', task);
app.use('/api/review', review);
app.use('/api/reservation', reservation);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error.message);
  });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
