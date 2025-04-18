const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const { quantity, format } = req.body;

  const prices = {
    A6: 250,
    A5: 400,
    A4: 600,
    A3: 1000,
  };

  const shipping = 650;
  const unitPrice = prices[format] || prices["A4"];
  const total = unitPrice * quantity + shipping;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Planche DTF ${format}`,
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://sublims-dtf.com/merci.html",
      cancel_url: "https://sublims-dtf.com/",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de la session Stripe" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Stripe en ligne.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur Stripe lancé sur le port ${PORT}`));