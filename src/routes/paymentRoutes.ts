import express from "express";

const router = express.Router();
const axios = require("axios");

// Intialize transaction
router.post("/transaction/initialize", async (req, res) => {
  try {
    const { email, amount } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ error: "Email and amount are required" });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Verify transaction
router.get("/transaction/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: "There is no reference" });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// List out all transaction
router.get("/transaction", async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }
    const response = await axios.get("https://api.paystack.co/transaction", {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch a unique transaction
router.get("/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "There is no Id" });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }
    const response = await axios.get(
      `https://api.paystack.co/transaction/${id}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
