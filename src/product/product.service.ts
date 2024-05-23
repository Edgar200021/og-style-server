import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  and,
  arrayOverlaps,
  between,
  count,
  eq,
  gte,
  inArray,
  like,
  or,
  sql,
} from 'drizzle-orm';
//eslint-disable-next-line
import { Multer } from 'multer';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';
import { CreateProductDto } from './dto/create-product.dto';
import { GetFiltersDto } from './dto/get-filters.dto';
import { ProductFilterDto } from './dto/product-filters.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsResponse } from './interfaces/get-products-response.interface';
@Injectable()
export class ProductService {
  static readonly LIMIT = 8;

  constructor(
    @Inject(DB_TOKEN) private db: NodePgDatabase<typeof schema>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async get(id: number): Promise<schema.Product & { brand: string }> | null {
    const product = await this.db
      .select({
        id: schema.product.id,
        name: schema.product.name,
        description: schema.product.description,
        price: schema.product.price,
        discountedPrice: schema.product.discountedPrice,
        discount: schema.product.discount,
        category: schema.product.category,
        subCategory: schema.product.subCategory,
        images: schema.product.images,
        size: schema.product.size,
        materials: schema.product.materials,
        colors: schema.product.colors,
        brandId: schema.product.brandId,
        brand: schema.brand.name,
      })
      .from(schema.product)
      .leftJoin(schema.brand, eq(schema.product.brandId, schema.brand.id))
      .where(eq(schema.product.id, id));

    return product[0] ?? null;
  }

  async getAll({
    limit = ProductService.LIMIT,
    page = 1,
    brand,
    category,
    colors,
    size,
    subCategory,
    material,
    maxPrice,
    minPrice = 0,
    name,
    search,
  }: ProductFilterDto): Promise<GetProductsResponse> {
    let brandIds: number[];

    if (brand) {
      const ids = await this.db
        .select({
          ids: sql<number[]>`array_agg(id)`,
        })
        .from(schema.brand)
        .where(inArray(schema.brand.name, brand));

      brandIds = ids[0].ids;
    }

    const filters = and(
      category && eq(schema.product.category, category),
      subCategory && eq(schema.product.subCategory, subCategory),
      size && arrayOverlaps(schema.product.size, size),
      material && arrayOverlaps(schema.product.materials, material),
      colors && arrayOverlaps(schema.product.colors, colors),
      brand && inArray(schema.product.brandId, brandIds),
      name && like(schema.product.name, `%${name}%`),
      search &&
        or(
          sql`'${sql.raw(search)}' LIKE '%' || ${schema.brand.name} || '%' AND ('${sql.raw(search)}' LIKE '%' || ${schema.product.category} || '%' OR '${sql.raw(search)}' LIKE '%' || ${schema.product.subCategory} || '%')`,
          sql`LOWER(${schema.brand.name}) LIKE '%${sql.raw(search)}%'`,
          sql`LOWER(${schema.product.category}) LIKE '%${sql.raw(search)}%'`,
          sql`LOWER(${schema.product.subCategory}) LIKE '%${sql.raw(search)}%'`,
          sql`LOWER(${schema.product.name}) LIKE '%${sql.raw(search)}%'`,
          sql`LOWER(${schema.product.description}) LIKE '%${sql.raw(search)}%'`,
        ),
      maxPrice
        ? between(schema.product.price, minPrice, maxPrice)
        : gte(schema.product.price, minPrice),
    );

    const [products, totalProducts] = await Promise.all([
      this.db
        .select({
          id: schema.product.id,
          name: schema.product.name,
          description: schema.product.description,
          price: schema.product.price,
          discountedPrice: schema.product.discountedPrice,
          discount: schema.product.discount,
          category: schema.product.category,
          subCategory: schema.product.subCategory,
          images: schema.product.images,
          size: schema.product.size,
          materials: schema.product.materials,
          colors: schema.product.colors,
          brandId: schema.product.brandId,
        })
        .from(schema.product)
        .leftJoin(schema.brand, eq(schema.product.brandId, schema.brand.id))
        .where(filters)
        .offset(page * limit - limit)
        .limit(limit),
      this.db
        .select({ count: count() })
        .from(schema.product)
        .leftJoin(schema.brand, eq(schema.product.brandId, schema.brand.id))
        .where(filters),
    ]);

    const totalPages = Math.ceil(totalProducts[0].count / limit);

    return { products, totalPages };
  }

  async create(createProductDto: CreateProductDto): Promise<schema.NewProduct> {
    const isExist = await this.db
      .select()
      .from(schema.product)
      .where(
        or(
          eq(schema.product.name, createProductDto.name),
          eq(schema.product.description, createProductDto.description),
        ),
      );

    if (isExist[0])
      throw new BadRequestException(
        `Продукт с таким названием или описанием уже существует`,
      );

    const discountedPrice = createProductDto.discount
      ? createProductDto.price -
        (createProductDto.price * createProductDto.discount) / 100
      : 0;

    const product = await this.db
      .insert(schema.product)
      .values({
        ...createProductDto,
        discountedPrice,
        //brandId: sql<number>`SELECT id FROM brand WHERE name = ${createProductDto.brand}`,
        brandId: 2,
      })
      .returning();

    return product[0];
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const isExists = await this.get(id);
    if (!isExists) throw new BadRequestException('Продукт не найден');

    const price = updateProductDto.price ?? isExists.price,
      discount = updateProductDto.discount ?? isExists.discount,
      discountedPrice = price - (price * discount) / 100;

    await this.db
      .update(schema.product)
      .set({ ...updateProductDto, discount, discountedPrice })
      .where(eq(schema.product.id, id));
  }

  async delete(id: number) {
    const isExist = await this.get(id);
    if (!isExist) throw new BadRequestException('Продукт не найден');

    await this.db.delete(schema.product).where(eq(schema.product.id, id));
  }

  async getFilters({ category }: GetFiltersDto) {
    const result = await this.db
      .execute(sql`SELECT ARRAY(SELECT DISTINCT UNNEST(size) as s FROM product WHERE category=${category} ORDER BY s ASC) as size, ARRAY(SELECT DISTINCT UNNEST(colors) FROM product WHERE category=${category}) as colors,(SELECT COALESCE(MIN(price),0) FROM product WHERE category=${category}) as min_price,(SELECT COALESCE(MAX(price),0) FROM product WHERE category=${category}) as max_price,(SELECT array_agg(b.name) FROM product JOIN brand as b ON b.id = product.id WHERE category=${category}) as brands ;

`);

    return result.rows[0];
  }

  async uploadImage(files: Express.Multer.File[]) {
    const images = await this.cloudinaryService.upload(files);

    return images;
  }
}
