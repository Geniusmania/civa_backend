const express = require("express");
const con = require("../db");
const partnerRoute = express.Router(); 

partnerRoute.post("/", async (req, res) => { 
  const {
    first_name,
    last_name,
    email,
    job_title,
    company_type, 
    assistance_request, 
  } = req.body;

  
  if (
    !first_name ||
    !last_name ||
    !email ||
    !job_title ||
    !company_type ||
    !assistance_request
  ) {
    return res.status(400).json({ error: "Required fields missing" }); 
  }

  try {
    const result = await con.query(
      "INSERT INTO partners (first_name, last_name, email, job_title, company_type, assistance_request) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [
        first_name,
        last_name,
        email,
        job_title,
        company_type, 
        assistance_request, 
      ]
    );
    
    res.status(201).json({
      message: "Partner information submitted successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting partner data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// DELETE a partner by ID
partnerRoute.delete("/partners/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false,
          error: "Valid partner ID required" 
        });
      }
  
      const result = await con.query(
        "DELETE FROM partners WHERE id = $1 RETURNING *",
        [id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ 
          success: false,
          error: "Partner not found" 
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Partner deleted successfully",
        deleted: result.rows[0]
      });
  
    } catch (error) {
      console.error("DELETE /partners error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to delete partner" 
      });
    }
  });// GET all partners (with optional filters)
  partnerRoute.get("/partners", async (req, res) => {
    try {
      const { 
        company_type, 
        search, 
        page = 1, 
        limit = 20 
      } = req.query;
  
      // Base query
      let query = "SELECT * FROM partners";
      const params = [];
      let paramCount = 0;
  
      // Add filters
      if (company_type) {
        paramCount++;
        query += ` WHERE company_type = $${paramCount}`;
        params.push(company_type);
      }
  
      if (search) {
        paramCount++;
        const searchClause = paramCount === 1 ? ' WHERE' : ' AND';
        query += `${searchClause} (first_name ILIKE $${paramCount} 
                  OR last_name ILIKE $${paramCount} 
                  OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
  
      // Add pagination
      paramCount++;
      query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((page - 1) * limit);
  
      // Execute query
      const result = await con.query(query, params);
  
      // Get total count
      const countQuery = company_type 
        ? `SELECT COUNT(*) FROM partners WHERE company_type = '${company_type}'`
        : "SELECT COUNT(*) FROM partners";
      const countResult = await con.query(countQuery);
  
      res.status(200).json({
        success: true,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        data: result.rows
      });
  
    } catch (error) {
      console.error("GET /partners error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch partners" 
      });
    }
  });
module.exports = partnerRoute;