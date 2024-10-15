const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db'); 
const userRoutes = require('./routes/user.route');  
const postRoutes = require('./routes/post.route')
const cors = require('cors')
 

dotenv.config(); 

const app = express();
app.use(cors())

// Middleware
app.use(express.json()); 

app.use('/api/users', userRoutes); 
app.use('/api/post', postRoutes); 

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
