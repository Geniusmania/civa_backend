const express = require("express");
const investorRoute = express.Router();
const con = require("../db");


investorRoute.post("/investors", async (req, res) => {
  const {
    full_name,
    email,
    organization,
    investment_interests, 
    engagement_preference, 
  } = req.body;

  // Validation
  if (!full_name || !email || !organization || !investment_interests) {
    return res.status(400).json({
      error:
        "Full Name, Email, Organization, and Investment Interests are required",
    });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate investment interests (must be array with at least one selection)
  if (
    !Array.isArray(investment_interests) ||
    investment_interests.length === 0
  ) {
    return res.status(400).json({
      error: "Please select at least one investment interest",
    });
  }

  try {
    // Convert array to PostgreSQL array format
    const interestsArray = `{${investment_interests.join(",")}}`;

    const result = await con.query(
      `INSERT INTO investors (
        full_name, 
        email, 
        organization, 
        investment_interests, 
        engagement_preference
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        full_name,
        email,
        organization,
        interestsArray,
        engagement_preference || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Investor information submitted successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving investor:", error);

    // Handle duplicate email error
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This email is already registered",
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET all investors
investorRoute.get("/investors", async (req, res) => {
  try {
    const {
      interest, 
      search,
      page = 1, 
      limit = 20,
    } = req.query;

    // Base query
    let query = "SELECT * FROM investors";
    const params = [];
    let paramCount = 0;

    // Add filters
    if (interest) {
      paramCount++;
      query += ` WHERE $${paramCount} = ANY(investment_interests)`;
      params.push(interest);
    }

    if (search) {
      paramCount++;
      const searchClause = `
          WHERE (full_name ILIKE $${paramCount} 
          OR email ILIKE $${paramCount} 
          OR organization ILIKE $${paramCount})
        `;
      query += paramCount === 1 ? " WHERE" : " AND";
      query += ` (full_name ILIKE $${paramCount} 
                   OR email ILIKE $${paramCount} 
                   OR organization ILIKE $${paramCount})`;
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

    // Get total count for pagination metadata
    const countQuery = "SELECT COUNT(*) FROM investors";
    const countResult = await con.query(countQuery);

    res.status(200).json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      data: result.rows,
    });
  } catch (error) {
    console.error("GET /investors error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch investors",
    });
  }
});
// DELETE an investor by ID
investorRoute.delete("/investors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Valid investor ID required",
      });
    }

    const result = await con.query(
      "DELETE FROM investors WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Investor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Investor deleted successfully",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE /investors error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete investor",
    });
  }
});
module.exports = investorRoute;
