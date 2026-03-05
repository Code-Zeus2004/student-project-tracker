const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const projectRoutes = require("./routes/projects");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.get("/", (req,res)=>{
    res.send("API Running");
});

app.listen(5000, ()=> console.log("Server running on port 5000"));

