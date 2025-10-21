const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
try {
const { MONGODB_URI, DATABASE_NAME } = process.env;

await mongoose.connect(MONGODB_URI, {
dbName: DATABASE_NAME,
useNewUrlParser: true,
useUnifiedTopology: true,
});

console.log(`MongoDB connecté sur la base : ${DATABASE_NAME}`);
} catch (error) {
console.error('Erreur de connexion MongoDB :', error);
process.exit(1);
}
};

module.exports = connectDB;