import { relations } from 'drizzle-orm';
import {
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
  price: integer('price').notNull(),
  discountedPrice: integer('discounted_price'),
  discount: integer('discount').default(0),
  category: text('category').notNull(),
  subCategory: text('sub_category').notNull(),
  images: text('images').array().notNull(),
  size: text('size').array().notNull(),
  materials: text('materials').array().notNull(),
  colors: text('colors').array().notNull(),
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

export const cartProduct = pgTable('cart_product', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id')
    .notNull()
    .references(() => cart.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => product.id, {
      onDelete: 'cascade',
    }),
  quantity: integer('quantity').notNull(),
  color: text('color').notNull(),
  size: text('size').notNull(),
});

export type CartProduct = typeof cartProduct.$inferSelect;
export type NewCartProduct = typeof cartProduct.$inferInsert;

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

export const cartProductRelations = relations(cartProduct, ({ one }) => ({
  cart: one(cart, {
    fields: [cartProduct.cartId],
    references: [cart.id],
  }),
  product: one(product, {
    fields: [cartProduct.productId],
    references: [product.id],
  }),
}));
