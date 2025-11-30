import { db } from "../src/db";
import { users, activities, participants } from "../src/db/schema";

// Sample data
const fakeUsers = [
  {
    id: crypto.randomUUID(),
    workosId: "user_01",
    email: "sarah.johnson@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    avatarUrl: null,
  },
  {
    id: crypto.randomUUID(),
    workosId: "user_02",
    email: "mike.chen@example.com",
    firstName: "Mike",
    lastName: "Chen",
    avatarUrl: null,
  },
  {
    id: crypto.randomUUID(),
    workosId: "user_03",
    email: "emma.davis@example.com",
    firstName: "Emma",
    lastName: "Davis",
    avatarUrl: null,
  },
  {
    id: crypto.randomUUID(),
    workosId: "user_04",
    email: "james.wilson@example.com",
    firstName: "James",
    lastName: "Wilson",
    avatarUrl: null,
  },
  {
    id: crypto.randomUUID(),
    workosId: "user_05",
    email: "olivia.brown@example.com",
    firstName: "Olivia",
    lastName: "Brown",
    avatarUrl: null,
  },
];

// Famous locations with coordinates
const locations = [
  {
    name: "Central Park, New York, NY, USA",
    lat: 40.785091,
    lng: -73.968285,
  },
  {
    name: "Golden Gate Park, San Francisco, CA, USA",
    lat: 37.769421,
    lng: -122.486214,
  },
  {
    name: "Hyde Park, London, UK",
    lat: 51.508515,
    lng: -0.163730,
  },
  {
    name: "Vondelpark, Amsterdam, Netherlands",
    lat: 52.358416,
    lng: 4.868889,
  },
  {
    name: "Parc du Luxembourg, Paris, France",
    lat: 48.846222,
    lng: 2.337644,
  },
  {
    name: "Griffith Park, Los Angeles, CA, USA",
    lat: 34.136223,
    lng: -118.294254,
  },
  {
    name: "Boston Common, Boston, MA, USA",
    lat: 42.355469,
    lng: -71.065315,
  },
  {
    name: "Millennium Park, Chicago, IL, USA",
    lat: 41.882702,
    lng: -87.622554,
  },
];

const sportTypes = [
  "Running",
  "Cycling",
  "Swimming",
  "Tennis",
  "Basketball",
  "Soccer",
  "Gym",
  "Bodybuilding",
  "Hiking",
  "Yoga",
  "Golf",
  "Volleyball",
  "Badminton",
];

const skillLevels = ["all", "beginner", "intermediate", "advanced"];

const activityTemplates = [
  {
    sport: "Running",
    titles: [
      "Morning Run in {location}",
      "5K Run Group",
      "Trail Running Adventure",
      "Casual Jog Session",
    ],
    descriptions: [
      "Join us for a refreshing morning run! All paces welcome. We'll meet at the main entrance and run together for about an hour.",
      "Regular running group meeting for a 5K run. Great way to stay fit and meet new people!",
      "Explore the trails with fellow runners. Moderate pace, beautiful scenery. Don't forget water!",
    ],
  },
  {
    sport: "Cycling",
    titles: [
      "Weekend Bike Ride",
      "Cycling Group - {location}",
      "Mountain Bike Adventure",
      "Casual City Cycling",
    ],
    descriptions: [
      "Leisurely bike ride through scenic routes. Bring your own bike and helmet. All levels welcome!",
      "Join our cycling group for a fun ride. We maintain a moderate pace and take breaks as needed.",
      "Challenge yourself on mountain trails! Experience required. Safety gear mandatory.",
    ],
  },
  {
    sport: "Tennis",
    titles: [
      "Tennis Doubles Match",
      "Tennis Practice Session",
      "Beginner Tennis Clinic",
      "Advanced Tennis Training",
    ],
    descriptions: [
      "Looking for players for doubles! Intermediate level preferred. Bring your own racket.",
      "Practice session for all levels. We'll work on serves, volleys, and footwork.",
      "Learn the basics of tennis in a friendly environment. Rackets available if needed.",
    ],
  },
  {
    sport: "Basketball",
    titles: [
      "Pickup Basketball Game",
      "3v3 Basketball Tournament",
      "Basketball Skills Practice",
      "Friendly Hoops Session",
    ],
    descriptions: [
      "Casual pickup game. We'll split into teams when we arrive. All skill levels welcome!",
      "Competitive 3v3 tournament. Sign up with your team or join as a free agent.",
      "Work on your skills! Shooting drills, passing practice, and scrimmage.",
    ],
  },
  {
    sport: "Yoga",
    titles: [
      "Sunrise Yoga Session",
      "Outdoor Yoga in {location}",
      "Beginner-Friendly Yoga",
      "Vinyasa Flow Class",
    ],
    descriptions: [
      "Start your day with a peaceful yoga session. Bring your own mat and water.",
      "Enjoy yoga in nature! Suitable for all levels. Mats provided if needed.",
      "Perfect for beginners. We'll focus on basic poses and breathing techniques.",
    ],
  },
  {
    sport: "Soccer",
    titles: [
      "Soccer Pickup Game",
      "Sunday Soccer Match",
      "Soccer Skills Training",
      "5-a-side Tournament",
    ],
    descriptions: [
      "Weekly soccer game! We'll split into teams. Bring shin guards and cleats.",
      "Friendly match every Sunday. All skill levels welcome. Just bring your energy!",
      "Improve your soccer skills. Drills and small-sided games. Beginners encouraged!",
    ],
  },
  {
    sport: "Hiking",
    titles: [
      "Weekend Hiking Trip",
      "Nature Hike in {location}",
      "Beginner Hiking Group",
      "Challenging Trail Hike",
    ],
    descriptions: [
      "Explore beautiful trails with our hiking group. Moderate difficulty, about 2 hours.",
      "Easy hike perfect for beginners. Great way to enjoy nature and meet people!",
      "Challenging hike for experienced hikers. Steep terrain, bring proper gear.",
    ],
  },
  {
    sport: "Swimming",
    titles: [
      "Morning Swim Session",
      "Lap Swimming Group",
      "Open Water Swimming",
      "Swimming for Fitness",
    ],
    descriptions: [
      "Join us for morning laps! All speeds welcome. Pool access included.",
      "Regular swimming group. We support each other to improve technique and endurance.",
      "Experience open water swimming in a safe, supervised environment.",
    ],
  },
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysFromNow: number, daysRange: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * daysRange));
  date.setHours(Math.floor(Math.random() * 12) + 8); // Between 8 AM and 8 PM
  date.setMinutes([0, 15, 30, 45][Math.floor(Math.random() * 4)]);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function generateActivity(organizer: typeof fakeUsers[0], index: number) {
  const location = getRandomItem(locations);
  const sportType = getRandomItem(sportTypes);
  const template = activityTemplates.find((t) => t.sport === sportType) || activityTemplates[0];

  const title = getRandomItem(template.titles).replace("{location}", location.name.split(",")[0]);
  const description = getRandomItem(template.descriptions);
  const skillLevel = getRandomItem(skillLevels);
  const maxParticipants = [5, 8, 10, 12, 15, 20][Math.floor(Math.random() * 6)];

  // Some activities are recurring
  const isRecurring = Math.random() > 0.7;
  const date = getRandomDate(1, 30);

  let recurrenceType = null;
  let recurrenceEndDate = null;
  let recurrenceDay = null;

  if (isRecurring) {
    recurrenceType = getRandomItem(["weekly", "biweekly", "monthly"]);
    recurrenceEndDate = new Date(date);
    recurrenceEndDate.setMonth(recurrenceEndDate.getMonth() + 3); // 3 months duration
    recurrenceDay = date.getDay();
  }

  return {
    id: crypto.randomUUID(),
    title,
    description,
    sportType,
    location: location.name,
    latitude: location.lat,
    longitude: location.lng,
    date,
    maxParticipants,
    skillLevel,
    isRecurring,
    recurrenceType,
    recurrenceEndDate,
    recurrenceDay,
    organizerId: organizer.id,
  };
}

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(participants);
    await db.delete(activities);
    await db.delete(users);

    // Insert users
    console.log("👥 Creating users...");
    await db.insert(users).values(fakeUsers);
    console.log(`✅ Created ${fakeUsers.length} users`);

    // Generate activities
    console.log("🏃 Creating activities...");
    const fakeActivities = [];

    // Each user creates 2-4 activities
    for (const user of fakeUsers) {
      const numActivities = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numActivities; i++) {
        fakeActivities.push(generateActivity(user, i));
      }
    }

    await db.insert(activities).values(fakeActivities);
    console.log(`✅ Created ${fakeActivities.length} activities`);

    // Add participants to activities
    console.log("🤝 Adding participants...");
    const fakeParticipants = [];

    for (const activity of fakeActivities) {
      // Organizer is always a participant
      fakeParticipants.push({
        id: crypto.randomUUID(),
        activityId: activity.id,
        userId: activity.organizerId,
        status: "confirmed" as const,
      });

      // Add random participants (1-5 others)
      const numParticipants = Math.min(
        Math.floor(Math.random() * 5) + 1,
        activity.maxParticipants - 1
      );

      const availableUsers = fakeUsers.filter((u) => u.id !== activity.organizerId);
      const selectedUsers = availableUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, numParticipants);

      for (const user of selectedUsers) {
        fakeParticipants.push({
          id: crypto.randomUUID(),
          activityId: activity.id,
          userId: user.id,
          status: "confirmed" as const,
        });
      }
    }

    await db.insert(participants).values(fakeParticipants);
    console.log(`✅ Created ${fakeParticipants.length} participant entries`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${fakeUsers.length}`);
    console.log(`   Activities: ${fakeActivities.length}`);
    console.log(`   Participants: ${fakeParticipants.length}`);
    console.log("\n💡 You can now login with any of these emails (no password needed in dev):");
    fakeUsers.forEach((user) => {
      console.log(`   - ${user.email}`);
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
