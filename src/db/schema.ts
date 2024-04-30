import { relations } from 'drizzle-orm';
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['user', 'admin']);

export const user = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  password: text('password'),
  name: text('name'),
  avatar: text('avatar'),
  passwordResetExpires: timestamp('password_reset_expires', {
    withTimezone: true,
  }),
  passwordResetToken: text('password_reset_token'),
  role: role('role').array().default(['user']),
  googleId: text('google_id'),
  githubId: integer('github_id'),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const brand = pgTable('brand', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const product = pgTable('product', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').unique().notNull(),
  price: decimal('price', { precision: 5, scale: 0 }).notNull(),
  discountedPrice: decimal('discounted_price', { precision: 5, scale: 0 }),
  discount: integer('discount'),
  category: text('category').notNull(),
  subCategory: text('sub_category').notNull(),
  images: text('images').array().notNull(),
  size: text('size').array().notNull(),
  materials: text('images').array().notNull(),
  colors: text('size').array().notNull(),
  brandId: integer('brand_id')
    .notNull()
    .references(() => brand.id, { onDelete: 'cascade' }),
});

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

export const cart = pgTable('cart', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export type Cart = typeof cart.$inferSelect;
export type NewCart = typeof cart.$inferInsert;

export const brandRelations = relations(brand, ({ one }) => ({
  product: one(product),
}));

export const productRelations = relations(product, ({ one }) => ({
  brand: one(brand, {
    fields: [product.brandId],
    references: [brand.id],
  }),
}));

export const userRelations = relations(user, ({ one }) => ({
  cart: one(cart),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
}));
