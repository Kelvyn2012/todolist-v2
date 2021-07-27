

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-Kelvin:Jenifer2012@cluster0.h7rrz.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });



const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];



  const listSchema = {
    name: String,
    items: [itemSchema]
  }


const List = mongoose.model("List", listSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
Item.find({},function(err, foundItems){
  if (foundItems.length === 0){
    Item.insertMany(defaultItem, function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Items has been updated succesfully")
      }
      res.redirect("/");
    });
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

})
// const day = date.getDate();

});

// A dynamic route parameters
app.get("/:customListname", function(req, res){
  customListname = _.capitalize(req.params.customListname);
  List.findOne({name:customListname},function(err, foundList){
    if(!err){
      if (!foundList){
        // create new list if not found
        const list = new List({
          name: customListname,
          items: defaultItem
        });

        list.save();
        res.redirect("/"+ customListname)
      }else{
        // show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
})

app.post("/", function(req, res){

  const itemName =  req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){

      Item.findByIdAndRemove(checkedItem, function(err){
        if (!err){
          console.log("succesfully Deleted")
          res.redirect("/")
        }
      })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItem}}}, function(err,foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
})


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
