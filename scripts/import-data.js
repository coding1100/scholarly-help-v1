const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importData() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    const db = client.db('scholarly_help');

    // Import assignment data
    const assignmentData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'assignment.json'), 'utf8'));
    await db.collection('assignments').insertOne(assignmentData);

    // Import online-class data
    const onlineClassData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'online-class.json'), 'utf8'));
    await db.collection('online_classes').insertOne(onlineClassData);

    console.log('Data imported successfully');
  } finally {
    await client.close();
  }
}

importData().catch(console.error);