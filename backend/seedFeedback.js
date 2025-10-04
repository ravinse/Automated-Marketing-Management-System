const mongoose = require("mongoose");
require("dotenv").config();

// Use the feedback database connection
const MONGODB_URI = process.env.MONGODB_URI;

const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  campaign: String,
  rating: Number,
  description: String,
  avatar: String,
  createdAt: Date
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

const sampleFeedbacks = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    campaign: 'Summer Sale 2024',
    rating: 5,
    description: 'Great campaign! The email content was engaging and relevant. I loved the personalized approach.',
    avatar: null,
    createdAt: new Date('2024-09-15')
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    campaign: 'Back to School',
    rating: 4,
    description: 'Good campaign but could use better timing. The content was great though!',
    avatar: null,
    createdAt: new Date('2024-09-10')
  },
  {
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    campaign: 'Flash Sale',
    rating: 3,
    description: 'The SMS was too frequent. Consider reducing frequency to avoid annoying customers.',
    avatar: null,
    createdAt: new Date('2024-09-08')
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    campaign: 'VIP Customer Rewards',
    rating: 5,
    description: 'Loved the personalized approach! Very effective and made me feel valued as a customer.',
    avatar: null,
    createdAt: new Date('2024-09-05')
  },
  {
    name: 'Tom Brown',
    email: 'tom.brown@example.com',
    campaign: 'Weekend Deals',
    rating: 3,
    description: 'Average campaign, nothing special. Could be more creative with the offers.',
    avatar: null,
    createdAt: new Date('2024-09-01')
  },
  {
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    campaign: 'Holiday Special',
    rating: 5,
    description: 'Excellent targeting! Got exactly what I needed. The timing was perfect!',
    avatar: null,
    createdAt: new Date('2024-08-28')
  },
  {
    name: 'David Wilson',
    email: 'david.w@example.com',
    campaign: 'Spring Collection',
    rating: 2,
    description: 'Not relevant to my interests. The products shown were not aligned with my purchase history.',
    avatar: null,
    createdAt: new Date('2024-08-25')
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    campaign: 'Early Bird Offers',
    rating: 4,
    description: 'Good content but poor delivery timing. Received it after the sale had started.',
    avatar: null,
    createdAt: new Date('2024-08-20')
  },
  {
    name: 'Robert Taylor',
    email: 'robert.t@example.com',
    campaign: 'Black Friday Preview',
    rating: 5,
    description: 'Outstanding campaign! Got early access to amazing deals. Will definitely participate again.',
    avatar: null,
    createdAt: new Date('2024-08-15')
  },
  {
    name: 'Michelle Lee',
    email: 'michelle.l@example.com',
    campaign: 'New Product Launch',
    rating: 4,
    description: 'Interesting products showcased. Would have liked more detailed information about each item.',
    avatar: null,
    createdAt: new Date('2024-08-10')
  }
];

async function seedFeedbacks() {
  try {
    console.log("Connecting to MongoDB Atlas (Feedback Database)...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to FeedbackDB");

    // Clear existing feedbacks
    await Feedback.deleteMany({});
    console.log("🗑️  Cleared existing feedbacks");

    // Insert sample feedbacks
    const result = await Feedback.insertMany(sampleFeedbacks);
    console.log(`✅ Successfully inserted ${result.length} feedbacks`);

    // Display summary
    const total = await Feedback.countDocuments();
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total Feedbacks: ${total}`);
    
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    console.log(`   Average Rating: ${avgRating[0]?.avgRating.toFixed(2) || 0}/5`);

    mongoose.connection.close();
    console.log("\n✅ Seeding completed and connection closed");
  } catch (error) {
    console.error("❌ Error seeding feedbacks:", error);
    process.exit(1);
  }
}

seedFeedbacks();
