import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-02-24.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) throw new Error("Missing stripe signature or secret");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      
      const tenantId = session.metadata?.tenantId;
      if (!tenantId) {
        console.error("No tenantId in session metadata");
        break;
      }

      // 1. Create the subscription record in DB
      await prisma.subscription.create({
        data: {
          tenantId: tenantId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
          plan: session.metadata?.plan || "cloud",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Approximate for now
        }
      });

      // 2. Trigger the Provisioning Engine!
      console.log(`[Stripe Webhook] Subscription created for Tenant ${tenantId}. Triggering provisioning...`);
      
      const provisionBaseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      try {
        const provisionReq = await fetch(`${provisionBaseUrl}/api/provision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PROVISIONING_SECRET}`
          },
          body: JSON.stringify({ tenantId })
        });
        
        if (!provisionReq.ok) {
          console.error(`Failed to provision Headscale: ${await provisionReq.text()}`);
        } else {
          console.log(`Successfully provisioned Headscale for Tenant ${tenantId}`);
        }
      } catch (e) {
        console.error(`Fetch to provisioning engine failed:`, e);
      }
      break;
      
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" }
      });
      // Here you would theoretically spin DOWN the container in the Provisioning Engine
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
