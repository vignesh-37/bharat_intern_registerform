const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const user = require('./model/user');

// Create Express app
const app = express();

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 8000;
const mongourl = process.env.mongoURI;

// Connect to MongoDB
mongoose.connect(mongourl).then(() => { console.log('Database connected'); });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.get('^/$|(register)?',(req,res)=>{
    try{
        res.render('register',{error:null})
    }
    catch(err){
        res.send(err.message)
    }
})

// Registration
app.post('/registeration', async (req, res) => {
    const { username, email, phone, gender, password, repassword } = req.body;

    if (!username || !email || !phone || !gender || !password || !repassword) {
        return res.render('register', { error: 'All fields are required' });
    }

    if (password !== repassword) {
        return res.status(500).render('register', { error: 'Passwords do not match' });
    }

    try {
        const existingUser = await user.findOne({ $or: [{ Username: username }, { Email: email }] });

        if (existingUser) {
            if (existingUser.Username === username) {
                return res.status(500).render('register', { error: 'Username already taken. Please enter a different username' });
            }
            if (existingUser.Email === email) {
                return res.status(500).render('register', { error: 'Email already taken. Use a different Email' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await user.create({ Username: username, Email: email, Phone: phone, Gender: gender, Password: hashedPassword });

        res.send({message:"Registration Sucessfull"});
    } catch (err) {
        console.log(err.message);
        res.render('register', { error: 'An error occurred. Please try again.' });
    }
});


// Start the server
app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}`); });
