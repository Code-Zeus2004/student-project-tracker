const express = require("express");
const router = express.Router();
const Project = require("../models/Project");


// ADD PROJECT
router.post("/", async (req, res) => {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
});


// GET ALL PROJECTS
router.get("/", async (req, res) => {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
});


// DELETE PROJECT
router.delete("/:id", async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

module.exports = router;

// UPDATE PROJECT
router.put("/:id", async (req, res) => {
    const updated = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updated);
});