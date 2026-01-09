import { db } from "./db";
import { services, availability, siteSettings } from "@shared/schema";

export async function seedDatabaseIfEmpty() {
  try {
    const existingServices = await db.select().from(services).limit(1);
    
    if (existingServices.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    console.log("Seeding database with initial data...");

    const availabilityData = [
      { dayOfWeek: 0, startTime: "09:00:00", endTime: "14:00:00", isAvailable: true },
      { dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 6, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
    ];

    for (const item of availabilityData) {
      await db.insert(availability).values(item);
    }

    const servicesData = [
      {
        name: "Concept Development Meeting",
        description: "This is a meeting where we discuss your vision, idea, or concept. flush out concepts to bring it to life, with results at the end of the session that you can take home and refine as you see fit. this is a 2 hour meeting, 2 hours is the minimum. additional hours can be plan and purchased in advance.",
        duration: 120,
        price: 5000,
        isActive: true,
        displayOrder: 1,
        displayMode: "both" as const
      },
      {
        name: "Logo design",
        description: "You will give me all the relevant ideas and concepts for the logo design you wish to have. I will create you 10 still renders and 5 moving icons",
        duration: 120,
        price: 5000,
        isActive: true,
        displayOrder: 2,
        displayMode: "both" as const
      },
      {
        name: "Website Skeleton Design",
        description: "Do you have a website that has to many moving parts? several 3rd party sources are needed to make what you feel like should be simple? Come have a creative meeting and leave with a visual representation of the website that is what you want the world to think of when they think your brand.",
        duration: 120,
        price: 5000,
        isActive: true,
        displayOrder: 3,
        displayMode: "both" as const
      },
      {
        name: "Website Launch",
        description: "You spent the time needed to get your site made as your dreams described and now your ready to go live to the world?",
        duration: 120,
        price: 10000,
        isActive: true,
        displayOrder: 4,
        displayMode: "both" as const
      },
    ];

    for (const item of servicesData) {
      await db.insert(services).values(item);
    }

    await db.insert(siteSettings).values({
      businessName: "Oraginal Concepts",
      tagline: "Give Me Your Concept, Let's Make It Real.",
      aboutText: "At Oraginal Concepts, we believe every idea deserves to be brought to life. Whether you need a stunning website, captivating video content, visual mockups, or custom music production — we're here to turn your concept into reality. Give us your vision, and let's make it happen. with 3D prints Coming Soon.",
      contactEmail: "nbadelo@gmail.com",
      contactPhone: "4056962095",
      address: "4522 Nw 16th st",
      footerTagline: "Give Me Your Concept, Let's Make It Real. Websites, videos, mockups, music — we bring your ideas to life."
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
