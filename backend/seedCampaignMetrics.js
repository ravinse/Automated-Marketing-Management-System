const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/marketing_automation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const seedCampaignMetrics = async () => {
  try {
    console.log('Starting to seed campaign performance metrics...');

    // Get all completed campaigns
    const completedCampaigns = await Campaign.find({ status: 'completed' });
    
    if (completedCampaigns.length === 0) {
      console.log('No completed campaigns found. Creating sample campaigns...');
      
      // Create sample campaigns with performance data
      const sampleCampaigns = [
        {
          title: 'Summer Sale Campaign',
          description: 'Promotional campaign for summer products',
          status: 'completed',
          createdBy: 'admin',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-30'),
          completedAt: new Date('2024-06-30'),
          performanceMetrics: {
            sent: 5000,
            delivered: 4850,
            opened: 1250,
            clicked: 250,
            conversions: 100,
            bounced: 150,
            unsubscribed: 25,
            revenue: 15000
          }
        },
        {
          title: 'Back to School Promotion',
          description: 'Educational products promotion',
          status: 'completed',
          createdBy: 'admin',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-31'),
          completedAt: new Date('2024-08-31'),
          performanceMetrics: {
            sent: 4500,
            delivered: 4400,
            opened: 990,
            clicked: 180,
            conversions: 90,
            bounced: 100,
            unsubscribed: 15,
            revenue: 12000
          }
        },
        {
          title: 'Holiday Promotion',
          description: 'Special holiday discounts',
          status: 'completed',
          createdBy: 'admin',
          startDate: new Date('2024-11-01'),
          endDate: new Date('2024-12-31'),
          completedAt: new Date('2024-12-31'),
          performanceMetrics: {
            sent: 6000,
            delivered: 5900,
            opened: 1800,
            clicked: 360,
            conversions: 150,
            bounced: 100,
            unsubscribed: 30,
            revenue: 25000
          }
        },
        {
          title: 'Customer Appreciation Day',
          description: 'Thank you campaign for loyal customers',
          status: 'completed',
          createdBy: 'admin',
          startDate: new Date('2024-09-15'),
          endDate: new Date('2024-09-15'),
          completedAt: new Date('2024-09-15'),
          performanceMetrics: {
            sent: 4000,
            delivered: 3950,
            opened: 1120,
            clicked: 220,
            conversions: 110,
            bounced: 50,
            unsubscribed: 10,
            revenue: 18000
          }
        },
        {
          title: 'New Product Launch',
          description: 'Introducing our latest product line',
          status: 'completed',
          createdBy: 'admin',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-15'),
          completedAt: new Date('2024-07-15'),
          performanceMetrics: {
            sent: 3000,
            delivered: 2950,
            opened: 600,
            clicked: 90,
            conversions: 60,
            bounced: 50,
            unsubscribed: 8,
            revenue: 9000
          }
        }
      ];

      await Campaign.insertMany(sampleCampaigns);
      console.log('Successfully created sample campaigns with performance metrics!');
    } else {
      console.log(`Found ${completedCampaigns.length} completed campaigns. Adding random metrics...`);
      
      // Update existing completed campaigns with random performance data
      for (const campaign of completedCampaigns) {
        const sent = Math.floor(Math.random() * 5000) + 1000;
        const delivered = Math.floor(sent * 0.97);
        const opened = Math.floor(sent * (Math.random() * 0.3 + 0.15)); // 15-45% open rate
        const clicked = Math.floor(opened * (Math.random() * 0.25 + 0.05)); // 5-30% of opened
        const conversions = Math.floor(clicked * (Math.random() * 0.3 + 0.1)); // 10-40% of clicked
        const bounced = sent - delivered;
        const unsubscribed = Math.floor(sent * 0.01);
        const revenue = conversions * (Math.random() * 150 + 50); // $50-$200 per conversion

        campaign.performanceMetrics = {
          sent,
          delivered,
          opened,
          clicked,
          conversions,
          bounced,
          unsubscribed,
          revenue: Math.round(revenue)
        };

        await campaign.save();
        console.log(`Updated metrics for campaign: ${campaign.title}`);
      }
      
      console.log('Successfully updated all completed campaigns with performance metrics!');
    }

    console.log('\nSample metrics summary:');
    const allCampaigns = await Campaign.find({ status: 'completed' });
    allCampaigns.forEach(campaign => {
      const metrics = campaign.performanceMetrics;
      const openRate = metrics.sent > 0 ? ((metrics.opened / metrics.sent) * 100).toFixed(2) : 0;
      const clickRate = metrics.sent > 0 ? ((metrics.clicked / metrics.sent) * 100).toFixed(2) : 0;
      console.log(`\n${campaign.title}:`);
      console.log(`  Sent: ${metrics.sent}`);
      console.log(`  Open Rate: ${openRate}%`);
      console.log(`  Click Rate: ${clickRate}%`);
      console.log(`  Conversions: ${metrics.conversions}`);
      console.log(`  Revenue: $${metrics.revenue}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding campaign metrics:', error);
    process.exit(1);
  }
};

seedCampaignMetrics();
