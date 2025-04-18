// index.js

const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { quantity, format, shipping } = req.body;

    // Tarifs en centimes
    const prices = {
      A6: 250,   // 2,50 €
      A5: 400,   // 4,00 €
      A4: 600,   // 6,00 €
      A3: 1000,  // 10,00 €
    };

    const unitPrice = prices[format] || prices.A4;
    // shipping est reçu en euros (0 ou 6.5)
    const shippingCents = Math.round((parseFloat(shipping) || 0) * 100);

    // montant total en centimes
    const totalAmount = unitPrice * quantity + shippingCents;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Planche DTF ${format}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://sublims-dtf.com/",
      cancel_url: "https://sublims-dtf.com/",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Échec création session Stripe" });
  }
});

app.get("/", (_req, res) => res.send("Stripe backend is up!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
