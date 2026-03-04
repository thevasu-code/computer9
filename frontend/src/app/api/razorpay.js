import Razorpay from "razorpay";

export async function POST(req) {
  const { amount, billing, cart } = await req.json();
  if (!amount || !billing || !cart) {
    return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // INR to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        name: billing.name,
        email: billing.email,
        address: billing.address,
      },
    });
    return new Response(JSON.stringify({ order, key: process.env.RAZORPAY_KEY_ID }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
