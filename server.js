const exrpess=require('express');
require('dotenv').config({path:'./config.env'});
const bodyParser=require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors=require('cors');
const app=exrpess();

app.use(cors());
app.use(helmet());
app.use(morgan("common"));

require('./db/conn');

const port=process.env.PORT || 6000;

app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({limit:"50mb",extended:true}));

app.use('/api/auth/user',require('./routes/authUser'));
app.use('/api/private/user',require('./routes/privateUser'));

app.use('/api/auth/doctor',require('./routes/authDoctor'));
app.use('/api/private/doctor',require('./routes/privateDoctor'));


app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})