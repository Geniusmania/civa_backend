const express = require("express");
const startupRoute = express.Router();
const con = require("../db");
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

startupRoute.post("/", upload.single('pitch_deck'), async (req, res) => {
  const {
    full_name,
    email,
    startup_name,
    startup_website,
    country,
    business_model,
    problem_statement,
    solution_description,
    startup_stage,
    funding_round,
    additional_info,
  } = req.body;

  const pitch_deck = req.file ? req.file.buffer : null; 
  const pitch_deck_filename = req.file ? req.file.originalname : null; 

  if (
    !full_name ||
    !email ||
    !startup_name ||
    !country ||
    !business_model ||
    !problem_statement ||
    !solution_description ||
    !startup_stage ||
    !funding_round
  ) {
    return res.status(400).json({ error: "Required fields are missing" });
  }
  
  try {
    const result = await con.query(
      `INSERT INTO startups (
          full_name, email, startup_name, startup_website, country, business_model, 
          pitch_deck, pitch_deck_filename, problem_statement, solution_description, startup_stage, funding_round, additional_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        full_name,
        email,
        startup_name,
        startup_website || null,
        country,
        business_model,
        pitch_deck,
        pitch_deck_filename,
        problem_statement,
        solution_description,
        startup_stage,
        funding_round,
        additional_info || null,
      ]
    );

    res.status(201).json({
      message: "Startup information submitted successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting startup data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


startupRoute.get("/", async (req, res) => {
    try {
      const result = await con.query("SELECT * FROM startups");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching startups:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


module.exports = startupRoute;
