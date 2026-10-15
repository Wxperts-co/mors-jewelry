const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection.db;
  const productsCol = db.collection('products');
  const categoriesCol = db.collection('categories');

  // Read JSON files
  const productsFile = path.join(process.cwd(), 'data', 'tbl_new_product.json');
  const categoriesFile = path.join(process.cwd(), 'data', 'tbl_category.json');

  const rawProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const rawCategories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));

  console.log(`Read ${rawProducts.length} products and ${rawCategories.length} categories from JSON.`);

  // Upsert products
  let pCount = 0;
  for (const item of rawProducts) {
    const productDoc = {
      id: String(item.id),
      category_id: String(item.category_id || ''),
      keywords: item.keywords || '',
      sku: item.sku || `SKU-${item.id}`,
      title: item.title || '',
      alias: item.alias || '',
      alt_name: item.alt_name || '',
      size: item.size || '',
      description: item.description || '',
      msrp: String(item.msrp || '0.00'),
      wholesale_cost: String(item.wholesale_cost || '0.00'),
      ground_shipping: String(item.ground_shipping || '0.00'),
      '3_day_express': item['3_day_express'] || '',
      '2_day_express': item['2_day_express'] || '',
      next_day: item.next_day || '',
      available: item.available || 'Yes',
      seasonal_item: item.seasonal_item || 'No',
      color_options: item.color_options || '',
      gift_card_option: item.gift_card_option || '',
      actual_weight: String(item.actual_weight || ''),
      box_size_L_W_H: item.box_size_L_W_H || '',
      cubed_weight: String(item.cubed_weight || ''),
      available_for_postal_shipping: item.available_for_postal_shipping || null,
      perishable: item.perishable || 'No',
      thumb_image: item.thumb_image || '',
      large_image: item.large_image || '',
      featured: String(item.featured || '0'),
      new_arrival: String(item.new_arrival || '0'),
      best_seller: String(item.best_seller || '0'),
      status: String(item.status || '1'),
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
    };

    await productsCol.updateOne(
      { id: String(item.id) },
      { $set: productDoc },
      { upsert: true }
    );
    pCount++;
  }
  console.log(`Successfully stored/upserted ${pCount} products in MongoDB.`);

  // Remove old placeholder category if present
  await categoriesCol.deleteMany({ category_id: { $exists: false } });

  // Upsert categories
  let cCount = 0;
  for (const cat of rawCategories) {
    const assignedCount = rawProducts.filter(
      (p) => String(p.category_id) === String(cat.category_id)
    ).length;

    const categoryDoc = {
      category_id: String(cat.category_id),
      parent_id: String(cat.parent_id || '0'),
      category_name: cat.category_name,
      name: cat.category_name,
      slug: cat.alias || cat.category_name.toLowerCase().replace(/\s+/g, '-'),
      alias: cat.alias || '',
      photourl: cat.photourl || null,
      activatedstatus: String(cat.activatedstatus || '1'),
      description: `${cat.category_name} collection`,
      itemCount: assignedCount,
      created_at: cat.created_at || '',
      updated_at: cat.updated_at || '',
    };

    await categoriesCol.updateOne(
      { category_id: String(cat.category_id) },
      { $set: categoryDoc },
      { upsert: true }
    );
    cCount++;
  }
  console.log(`Successfully stored/upserted ${cCount} categories in MongoDB.`);

  const finalP = await productsCol.countDocuments();
  const finalC = await categoriesCol.countDocuments();

  console.log(`\nVerification Complete!`);
  console.log(`- Products in Database: ${finalP}`);
  console.log(`- Categories in Database: ${finalC}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
