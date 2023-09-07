
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ayushman45:Mongo45@cluster0.fsl6von.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema={
  name:String
}

const Item = mongoose.model("Item", itemsSchema);

const userSchema={
  email:String,
  fname:String,
  lname:String,
  username:String,
  password:String,
  items:[itemsSchema]
}

const User = mongoose.model("User", userSchema);

app.get("/",function(req,res){
  res.render("home")
})

app.get("/login",function(req,res){
  res.render("login")
})

app.post("/login",function(req,res){
  uname=req.body.username;
  pass=req.body.password;
  User.findOne({username:uname,password:pass})
  .then((usr) => {
    if(usr){
      console.log(usr._id);
      res.render("dashboard",{usr:usr})
    }
    else{
      res.send("<h3>Username or Password is incorrect. Click here to try again. <a href=\"/login\">Login</a></h3>")
    }
  });
})

app.get("/signup",function(req,res){
  res.render("signup")
})



app.post("/delete/:uid/:itm",function(req,res){
  const reqUser=req.params.uid;
  const itemid=req.params.itm;
  User.findOne({_id:reqUser})
  .then((usr) => {
    const nlist=usr.items;
    const newlist=[]
    var i=0
    while(i<nlist.length){
      if(nlist[i]._id==itemid){
          ++i;
      }
      else{
        newlist.push(nlist[i])
        ++i;
      }
    }
    console.log(newlist);

    const filter = { _id: usr._id };
    const update = { items: newlist };
    User.findOneAndUpdate(filter, update, { new: true })
      .then(updatedUser => {
        if (updatedUser) {
          res.render("dashboard",{usr:updatedUser})
        } else {
          console.log('User not found');
        }
      })
      .catch(err => {
        console.error('Error updating user:', err);
      });


  })
  .catch((err) => {
    console.log(err);
  })
})




app.post("/:uid/add",function(req,res){
  const reqUser=req.params.uid;
  const str=req.body.newItem;
  User.findOne({_id:reqUser})
  .then((usr) => {
    const item_new=new Item({
      name:str
    })
    item_new.save()

    const nlist=usr.items;
    nlist.push(item_new)

    const filter = { _id: usr._id };
    const update = { items: nlist };
    User.findOneAndUpdate(filter, update);

    console.log(usr.items);

    usr.save()

    res.render("dashboard",{usr:usr})

  })
  .catch((err) => {
    console.log(err);
  })
})
app.get("/:uid",function(req,res){
  const reqUser=req.params.uid;
  User.findOne({_id:reqUser})
  .then((usr) => {
    res.render("dashboard",{usr:usr})
  })
})








app.post("/signup",function(req,res){
  uname=req.body.username;
  pass=req.body.password;
  mail=req.body.email;
  fn=req.body.fname;
  ln=req.body.lname;
  User.findOne({username:uname})
  .then((usr) => {
    if(usr){
      res.send("<h3>User exits. Click here to login. <a href=\"/login\">Login</a></h3>")
    }
    else{
      const item1 = new Item({
        name: "Click to delete"
      });
      
      item1.save()
      const defaultItems = [item1];
      const user1=new User({
        fname:fn,
        lname:ln,
        username:uname,
        password:pass,
        email:mail,
        items:defaultItems
      })

      user1.save()
      res.render("login")
    }
  })
  .catch((error) => {
    console.log(err);
  });
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
