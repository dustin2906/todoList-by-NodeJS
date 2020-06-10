//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-duc:Md3726427@cluster0-hgjea.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = ({
  name: {
    type: String,
    required: [true,"Please check your data entry"]
  },
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todoList"
});

const item2 = new Item ({
  name: "Hit the + button to add new item"
});

const item3 = new Item ({
  name: "<-- Hit this button to delete an item"
});

const defaultItems = [item1,item2,item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

/*
Item.deleteOne({_id: "5eda662aa950cb4aec6b551f"}, function(err) {
  if (err) {
    console.log(err)
  }
  else {
    console.log("delete successfully!")
  }
})
*/

app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {

    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("Insert successfully!")
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  });
  
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const ListName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(ListName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:ListName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + ListName)
    })
  }
});

app.post("/delete", function(req,res) {
const checkedItemID = req.body.checkbox;
const listName = req.body.listName;

if( listName === "Today") {
  Item.findByIdAndRemove(checkedItemID, function(err) {
    if (err) {
      console.log(err)
    }
    else {
      console.log("remove successed!")
      res.redirect("/");
    }
  });
}
else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID} } }, function(err,foundList) {
    if(!err) {
      res.redirect("/" + listName);
    }
  })
}
})


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne( {name:customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        // create new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        //show an new list

        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started successfully")
});

