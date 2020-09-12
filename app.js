//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const __ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// mongoose.connect("mongodb+srv://tonystank:i1024166@honeybadger.kck47.mongodb.net/todolistDB",{ useNewUrlParser: true ,useUnifiedTopology: true})
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true })



const itemSchema = {
  name: String
}

const Item = mongoose.model("Item",itemSchema)



const item1 = new Item({
  name : "Welcome to the to do list"
})

const item2 = new Item({
  name : "Hit the + button to add a new item"
})

const item3 = new Item({
  name : "Hit this to deconste an item"
})


const defaultItems = [item1,item2,item3]

const listSchema = {
  name : String,
  items : [itemSchema]
}

const List = mongoose.model("List",listSchema)


app.get("/", function(req, res) {
  Item.find({},function(err,founditems){

    if (founditems.length === 0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err)
        }else{
          console.log("Success");
        }
      })
      
    }
    res.render("list", {listTitle: "Today", newListItems: founditems});

  })


});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", function(req,res){
  
  const customListName = __.capitalize(req.params.customListName.trim())
  if (customListName === "favicon.ico") {
    res.redirect("/")
  } else {
    List.findOne({name: customListName},function(err,foundItems){
      if (!err) {
          if (!foundItems) {
            const list = new List({
              name : customListName,
              items : defaultItems
            })
            list.save()
            res.redirect("/"+customListName)
          }else{
            res.render("list", {listTitle: foundItems.name, newListItems: foundItems.items});
          }
  
      }else{
        console.log("Error")
      }
  
    })
    
  }
  
  

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(req,res) {
  console.log("Server started on port 3000");
});



app.post("/delete",function (req,res) {
    const checkedItemId = req.body.checkbox
    const listTitle = req.body.listName.trim()
    if (listTitle === "Today") {
      Item.findByIdAndRemove(checkedItemId,function (err) { 
        if (!err) {
          console.log("Item was deleted succesfully")
          res.redirect("/")
        }
       })
    }else{
      List.findOneAndUpdate()
      List.findOneAndUpdate({name : listTitle},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
        if (!err){
          res.redirect("/"+listTitle)
        }
      })
    }

    
  })