const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const questions = [
  // Funny
  { text: 'lied about my age', category: 'funny', difficulty: 'easy' },
  { text: 'pretended to be sick to skip school/work', category: 'funny', difficulty: 'easy' },
  { text: 'eaten food that fell on the floor', category: 'funny', difficulty: 'easy' },
  { text: 'danced in front of a mirror', category: 'funny', difficulty: 'easy' },
  { text: 'sung in the shower', category: 'funny', difficulty: 'easy' },
  { text: 'talked to myself', category: 'funny', difficulty: 'easy' },
  { text: 'pretended to laugh at a joke I didn\'t understand', category: 'funny', difficulty: 'medium' },
  { text: 'googled my own name', category: 'funny', difficulty: 'medium' },
  { text: 'cried during a movie', category: 'funny', difficulty: 'medium' },
  { text: 'stolen something from a hotel', category: 'funny', difficulty: 'medium' },
  
  // Deep
  { text: 'questioned my life choices', category: 'deep', difficulty: 'medium' },
  { text: 'had a panic attack', category: 'deep', difficulty: 'hard' },
  { text: 'lied to my best friend', category: 'deep', difficulty: 'medium' },
  { text: 'regretted a major decision', category: 'deep', difficulty: 'hard' },
  { text: 'felt completely lost in life', category: 'deep', difficulty: 'hard' },
  { text: 'pretended to be happy when I wasn\'t', category: 'deep', difficulty: 'medium' },
  { text: 'hurt someone I care about', category: 'deep', difficulty: 'hard' },
  { text: 'questioned my beliefs', category: 'deep', difficulty: 'medium' },
  
  // Party
  { text: 'danced on a table', category: 'party', difficulty: 'medium' },
  { text: 'kissed a stranger', category: 'party', difficulty: 'hard' },
  { text: 'streaked', category: 'party', difficulty: 'hard' },
  { text: 'drank before noon', category: 'party', difficulty: 'easy' },
  { text: 'been kicked out of a bar', category: 'party', difficulty: 'hard' },
  { text: 'made out in public', category: 'party', difficulty: 'medium' },
  { text: 'blacked out', category: 'party', difficulty: 'hard' },
  { text: 'woken up in a strange place', category: 'party', difficulty: 'hard' },
  { text: 'danced on a bar', category: 'party', difficulty: 'hard' },
  { text: 'had a one-night stand', category: 'party', difficulty: 'hard' },
  
  // Romantic
  { text: 'been in love', category: 'romantic', difficulty: 'easy' },
  { text: 'had my heart broken', category: 'romantic', difficulty: 'medium' },
  { text: 'fallen in love at first sight', category: 'romantic', difficulty: 'medium' },
  { text: 'dated someone I met online', category: 'romantic', difficulty: 'medium' },
  { text: 'been on a blind date', category: 'romantic', difficulty: 'medium' },
  { text: 'kissed someone in the rain', category: 'romantic', difficulty: 'medium' },
  { text: 'written a love letter', category: 'romantic', difficulty: 'easy' },
  { text: 'been cheated on', category: 'romantic', difficulty: 'hard' },
  { text: 'cheated on someone', category: 'romantic', difficulty: 'hard' },
  { text: 'proposed or been proposed to', category: 'romantic', difficulty: 'hard' },
  
  // Wild
  { text: 'gone skinny dipping', category: 'wild', difficulty: 'hard' },
  { text: 'had a threesome', category: 'wild', difficulty: 'hard' },
  { text: 'been arrested', category: 'wild', difficulty: 'hard' },
  { text: 'stolen something', category: 'wild', difficulty: 'hard' },
  { text: 'been in a fight', category: 'wild', difficulty: 'hard' },
  { text: 'broken a bone', category: 'wild', difficulty: 'medium' },
  { text: 'gotten a tattoo', category: 'wild', difficulty: 'medium' },
  { text: 'gotten a piercing', category: 'wild', difficulty: 'medium' },
  { text: 'been to a strip club', category: 'wild', difficulty: 'hard' },
  { text: 'done drugs', category: 'wild', difficulty: 'hard' },
  
  // General
  { text: 'traveled alone', category: 'general', difficulty: 'medium' },
  { text: 'been on TV', category: 'general', difficulty: 'hard' },
  { text: 'met a celebrity', category: 'general', difficulty: 'hard' },
  { text: 'been in a car accident', category: 'general', difficulty: 'medium' },
  { text: 'broken something expensive', category: 'general', difficulty: 'easy' },
  { text: 'been to a concert', category: 'general', difficulty: 'easy' },
  { text: 'been on a plane', category: 'general', difficulty: 'easy' },
  { text: 'been to another country', category: 'general', difficulty: 'medium' },
  { text: 'learned a second language', category: 'general', difficulty: 'medium' },
  { text: 'run a marathon', category: 'general', difficulty: 'hard' },
  { text: 'been skydiving', category: 'general', difficulty: 'hard' },
  { text: 'been bungee jumping', category: 'general', difficulty: 'hard' },
  { text: 'been camping', category: 'general', difficulty: 'easy' },
  { text: 'been fishing', category: 'general', difficulty: 'easy' },
  { text: 'been hunting', category: 'general', difficulty: 'medium' },
];

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/never-have-i-ever';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert new questions
    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} questions`);
    
    await mongoose.connection.close();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

