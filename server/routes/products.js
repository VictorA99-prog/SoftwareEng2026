const express = require("express");
const operations = require("../../database/operations.js");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Products landing page." });
});

router.get("/all", async (req, res) => {
  try {
    const result = await operations.getAllProducts();

    if (Array.isArray(result)) return res.json(result);

    if (result?.error) {
      console.log("Supabase error:", result.error);
      return res.status(500).json({ error: result.error.message || String(result.error) });
    }

    if (Array.isArray(result?.data)) return res.json(result.data);

    return res.json([]);
  } catch (e) {
    console.log("getAllProducts failed:", e);
    return res.status(500).json({ error: "Failed to load products" });
  }
});

module.exports = router;
