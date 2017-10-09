//*****1. require express********
// Load the express module that we install using npm
var express = require("express");
var app = express();
var mongoose = require('mongoose');
//format date
var moment = require('moment');
moment().format();

//*****Create Associations*******
// define Schema variable
var Schema = mongoose.Schema;
// define Post Schema
var PostSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4 },
  text: {type: String, required: true },
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

// define Comment Schema
var CommentSchema = new mongoose.Schema({
  _post: {type: Schema.Types.ObjectId, ref: 'Post'},
  name: {type: String, required: true, minlength: 4 },
  text: {type: String, required: true }
}, {timestamps: true });
// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

//***PARSE DATA*****
// require body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
// our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/dashboard'); //basic_mongoose is the name of my db


//**** 2. create routes ********
app.get('/', function (req, res){
  Post.find({})
  .populate('comments')
  .exec(function(err, posts) {
    if(err){
      console.log("We got error", err);
    } else {
      res.render('index', {messages: posts, moment: moment})
    }

  });
});




// route to create new message
app.post('/create_message', function (req, res){
  console.log("POST DATA ", req.body);
  // create a new Post with the name and text corresponding to those from req.body
  var post = new Post({name: req.body.name, text: req.body.message});
  // Try to save that new post to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
  post.save(function(err) {
    // if there is an error console.log that something went wrong!
    if(err) {
      console.log('something went wrong', err);
    } else { // else console.log that we did well and then redirect to the root route
      console.log('successfully added a message!');
      //redirect the user back to the root route.
      res.redirect('/')
    }
  })
});

// route to create new COMMENT
app.post('/create_comment/:id', function (req, res){
  console.log("POST DATA ", req.body);
  Post.findOne({_id: req.params.id}, function(err, post){
    var comment = new Comment(req.body);
    console.log(req.body);
    comment._post = post._id;
    post.comments.push(comment);
    comment.save(function(err){
      if(err) { console.log("We got an error",err); }
      post.save(function(err){
        if(err) { console.log('Error'); }
        else { res.redirect('/'); }
      });
    });
  });
});


//******3 Call the listen function
// Tell the express app to listen on port 8000
app.listen(8000, function() {
  console.log("listening on port 8000");
})
