import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PRICES = {
  landlord: process.env.STRIPE_PRICE_LANDLORD!,
  accountant: process.env.STRIPE_PRICE_ACCOUNTANT!,
}
