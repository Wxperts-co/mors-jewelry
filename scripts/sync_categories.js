const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envFile, 'utf8');
const match = env.match(/MONGO_URI=(.+)/);
const uri = match[1].trim();

async function run() {
  await mongoose.connect(uri);
  const productsCol = mongoose.connection.db.collection('products');
  const categoriesCol = mongoose.connection.db.collection('categories');

  const products = await productsCol.find({}).toArray();
  console.log('Total products in DB:', products.length);

  for (const p of products) {
    const id = parseInt(p.id, 10);
    let assigned = p.category_id;
    if (!['1', '2', '3'].includes(String(assigned))) {
      if (id % 3 === 1) assigned = '2'; // Diamond
      else if (id % 3 === 2) assigned = '1'; // Gold
      else assigned = '3'; // Silver
      await productsCol.updateOne({ _id: p._id }, { $set: { category_id: assigned } });
    }
  }

  const all = await productsCol.find({}).toArray();
  const dist = {};
  for (const p of all) {
    dist[p.category_id] = (dist[p.category_id] || 0) + 1;
  }
  console.log('New category distribution in DB:', dist);

  for (const catId of ['1', '2', '3']) {
    const count = dist[catId] || 0;
    await categoriesCol.updateOne({ category_id: catId }, { $set: { itemCount: count } });
  }

  console.log('Categories updated with counts.');
  await mongoose.disconnect();
}
run();
