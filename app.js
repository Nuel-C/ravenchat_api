const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const User = require('./models/user')
const Report = require('./models/report')
const formatMessage = require('./utils/formatMessage')
global.username = ''

const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())

//Connect Db
mongoose.connect('mongodb+srv://Nuel:chuks@cluster0.ldv66.mongodb.net/raven?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
// mongoose.connect('mongodb://localhost/raven', {useNewUrlParser: true, useUnifiedTopology: true})

//Run when client connects
io.on('connection', socket => {
    console.log('New connection...')
    // socket.emit('message', formatMessage(username, 'welcome'+ ' ' +username))

    //Broadcast when a user connects
    // socket.broadcast.emit('message', formatMessage(username, username+ ' ' +'has joined the chat' ))

    //Runs when client disconnects
    // socket.on('disconnect', () => {
    //   io.emit('message', formatMessage(username, username+ ' ' +'has left the chat'))
    // })

    //Listen for chatMessage
    socket.on('chatMessage', message => {
        io.emit('message', formatMessage(message.username, message.message))
    })
})

//Routes
app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/index.html");
})

app.get('/chat', (req, res)=>{
    res.redirect('/')
})


app.post('/signup', (req, res)=>{
  User.findOne({username: req.body.username}, async (err, user)=>{
      if(err) throw err
      if(user){
          var c = {success:false, msg:"User already exists"}
          res.send(c)
      } 
      if(!user){
          var salt = await bcrypt.genSaltSync(10);
          var hash = await bcrypt.hashSync(req.body.password, salt);
          const newUser = new User({
              username: req.body.username,
              password: hash,
          })
          await newUser.save((err, reg)=>{
              console.log(reg._id)
              var c = {
                  username:reg.username, 
                  msg:"Success", 
                  success: true, 
                  id: reg._id, 
                }
              username = reg.username
              res.send(c)
          })  
      }
  })
})

app.post('/login', (req, res)=>{
  User.findOne({username: req.body.username}, (err, user)=>{
      if(err){
          var c = {
              success : false,
              message: "An unknown error occured",
          }
          res.send(c)
      }else if(!user) {
          var c = {
              success : false,
              message: "No User Found",
          }
          console.log(c)
          res.send(c)
      }else{
          password = user.password
          bcrypt.compare(req.body.password, password, (err, isMatch)=>{
              if(isMatch === true){
                  var c = {
                      success : true,
                      message: "Login Successful",
                      username: user.username,
                      id: user._id,
                  }
                  username = user.username
                  res.send(c) 
              }else{
                  var c = {
                      success : false,
                      message: "Incorrect Password",
                  }
                  res.send(c)
          }
          })
      }
  })
})

app.post('/report', (req, res)=>{
    Report.create({username: req.body.username, reason: req.body.reason}, (err, data)=>{
        if(err){
            var c = {
                success : false,
                message: "Server Error, Please Retry"
            }
            res.send(c) 
        }else if(data){
            var c = {
                success : true,
                message: "Submit Successful"
            }
            res.send(c) 
        }
        
    })
})

app.get('/getreports', (req, res)=>{
    Report.find({}, (err, data)=>{
        if(err){
            var c = {
                success : false,
                message: "Server Error, Please Retry"
            }
            res.send(c) 
        }else if(data){
            console.log(data)
            var c = {
                success : true,
                message: "Submit Successful",
                reports: data
            }
            res.send(c) 
        }
        
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))

