const exrpess=require('express');
require('dotenv').config({path:'./config.env'});
const bodyParser=require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('./db/conn');

const app=exrpess();
const port=process.env.PORT || 6000;

app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({limit:"50mb",extended:true}));
app.use(helmet());
app.use(morgan("common"));

app.use('/api/auth',require('./routes/auth'));
app.use('/api/private',require('./routes/private'));

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})