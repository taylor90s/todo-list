const express = require("express");
const app = express();
const _ = require("lodash");
const port = process.env.PORT || 3001;
const bodyParser = require("body-parser");

const ejs = require("ejs");
app.set('view engine', 'ejs');

const toDay = require(__dirname+"/date.js");

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const mongoLink = "mongodb://127.0.0.1:27017/todoListDB";
const mongoAtlasLink = "mongodb+srv://Cluster11330:QVdeWk59UUVS@cluster11330.hoi1bgj.mongodb.net/todoListDB?retryWrites=true&w=majority"
mongoose.connect(mongoAtlasLink,function(err){
  if(err) console.log(err);
  else console.log("Succesfully connect to MongoDB");
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Workout"
})

const item2 = new Item({
  name: "Shopping"
})

const item3 = new Item({
  name: "Sleep"
})

const customListSchema = new mongoose.Schema({
  name: String,
  item: [itemSchema]
})

const CustomList = new mongoose.model("customlist",customListSchema);

const defaultItems = [item1, item2, item3];

var taskItems = [];
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

app.get("/", function(req, res) {
  const timeString = toDay.getDate();
  //var dayName = dayOfWeek[day];
  //res.sendFile(__dirname + "/index.html");
  //res.send("<h1> Today is "+dayName+"</h1>");
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err) console.log(err);
        else console.log("Succesfully insert new documents");
      })
      res.redirect("/");
    }
    else{
        res.render('index',{h_day: timeString, hTaskList: foundItems});
    }
  });
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);
  CustomList.findOne({name:customListName},function(err,result){
    if(!err){
      console.log(result);
      if(!result){
        const newCustomList = new CustomList({
          name:customListName,
          item: defaultItems
        });

        wait2Save(newCustomList);

        console.log("Successfully create new collection");
        res.redirect("/"+customListName);
      }
      else{
        console.log("Found existing list!");
        res.render('index',{h_day: customListName, hTaskList:result.item});
      }
    }
  })
})

async function wait2Save(newCustomList){
  await newCustomList.save();
}
app.get("/about",function(req,res){
  res.render('about');
}
)

app.post("/delete",function(req,res){
  console.log(res.body);
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;
  const timeString = toDay.getDate();
  if(listName==timeString){
  Item.deleteOne({_id:deleteId},function(err){
    if(err) console.log(err);
    else{
      console.log("Succesfully delete on MongoDB");
      res.redirect("/")
    }
  });
}
else{
  CustomList.findOneAndUpdate({name:listName},{$pull:{item:{_id:deleteId}}},function(err,foundItem){
    res.redirect("/"+listName);
  })
}
})

app.post("/",function(req,res){
  //taskItems.push(req.body.task);
  console.log(req.body);
  const listName = req.body.listName;
  const timeString = toDay.getDate();
  const newItem = new Item({
    name: req.body.task
  });
  if(listName == timeString){
    wait2Save(newItem);
    res.redirect("/");
  }
  else{
    CustomList.findOne({name:listName},function(err,foundList){
      if(!err){
        if(foundList){
          foundList.item.push(newItem);
          wait2Save(foundList);
          res.redirect("/"+listName);
        }
      }
    });
  }
});

app.listen(port, function() {
  console.log("Server running at 3000 port");
})
