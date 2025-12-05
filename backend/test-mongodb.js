#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testMongoDB() {
    console.log('🗄️  TESTING MONGODB CONNECTION');
    console.log('================================\n');

    const MONGODB_URI = process.env.MONGODB_URI;
    
    console.log('📋 MongoDB Configuration:');
    console.log(`   URI: ${MONGODB_URI?.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`   Database: ${MONGODB_URI?.split('/').pop()?.split('?')[0]}\n`);

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env file');
        process.exit(1);
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ MongoDB connection successful!\n');

        // Get database stats
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        console.log('📊 Database Statistics:');
        console.log(`   Database: ${stats.db}`);
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${stats.indexes}`);
        console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB\n`);

        // List collections
        const collections = await db.listCollections().toArray();
        console.log('📦 Collections in Database:');
        if (collections.length > 0) {
            for (const collection of collections) {
                const count = await db.collection(collection.name).countDocuments();
                console.log(`   - ${collection.name}: ${count} documents`);
            }
        } else {
            console.log('   No collections found (database is empty)');
        }

        console.log('\n🎉 MONGODB CONNECTION TEST SUCCESSFUL!\n');

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ MONGODB CONNECTION FAILED:');
        console.error(`   Error: ${error.message}`);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.error('\n💡 Connection timeout. Please check:');
            console.error('   1. MongoDB URI is correct');
            console.error('   2. Database user credentials are valid');
            console.error('   3. IP address is whitelisted in MongoDB Atlas');
            console.error('   4. Network firewall allows MongoDB connections (port 27017)');
        } else if (error.name === 'MongoParseError') {
            console.error('\n💡 Invalid connection string. Please check:');
            console.error('   1. MONGODB_URI format is correct');
            console.error('   2. Special characters in password are URL-encoded');
        }
        
        console.error('\n📝 Full error details:');
        console.error(error);
        process.exit(1);
    }
}

testMongoDB();
