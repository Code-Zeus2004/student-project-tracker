const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET ALL PROJECTS
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ 
            message: "Failed to fetch projects", 
            error: error.message 
        });
    }
});

// ADD PROJECT
router.post("/", async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ 
            message: "Failed to create project", 
            error: error.message 
        });
    }
});

// UPDATE PROJECT
router.put("/:id", async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updated) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        res.json(updated);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(400).json({ 
            message: "Failed to update project", 
            error: error.message 
        });
    }
});

// DELETE PROJECT
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Project.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        res.json({ message: "Project deleted successfully", id: req.params.id });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            message: "Failed to delete project", 
            error: error.message 
        });
    }
});

module.exports = router;