import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-02-24.acacia' as any, // Bypass strict type check for now or use the latest
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/dashboard", req.url));
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');

    if (plan !== 'cloud') {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // 1. Get or create Tenant for this user
    let tenantUser = await prisma.tenantUser.findFirst({
      where: { userId: (session?.user as any)?.id, role: "OWNER" },
      include: { tenant: true }
    });

    let tenantId;
    if (!tenantUser) {
      const tenant = await prisma.tenant.create({
        data: {
          name: `${(session?.user as any)?.name || (session?.user as any)?.email}'s Network`,
          users: {
            create: {
              userId: (session?.user as any)?.id,
              role: "OWNER"
            }
          }
        }
      });
      tenantId = tenant.id;
    } else {
      tenantId = tenantUser.tenantId;
    }

    // 2. Create Stripe Checkout Session
    // In production, we'd use a real Price ID from Stripe
    // For now, we'll use a placeholder or test mode price if defined, else generic priceData
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'LavaMesh Cloud',
              description: 'Managed Headscale Instance',
            },
            unit_amount: 3900, // $39.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/#pricing`,
      metadata: {
        tenantId: tenantId,
        userId: session.user.id,
        plan: 'cloud'
      }
    });

    return NextResponse.redirect(checkoutSession.url as string);
  } catch (error: any) {
    console.error("[Checkout Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
