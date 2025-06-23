import request from "supertest";
import app from "../../src/index"; // uses exported app
import mongoose from "mongoose";

describe("Events API", () => {
  // Close DB after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /events", () => {
    it("should return 200 OK and an array of events", async () => {
      const res = await request(app).get("/events");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("events");
      expect(Array.isArray(res.body.events)).toBe(true);
    });

    it("should return events with required properties", async () => {
      const res = await request(app).get("/events");

      if (res.body.events.length > 0) {
        const event = res.body.events[0];
        expect(event).toHaveProperty("title");
        expect(event).toHaveProperty("date");
        expect(event).toHaveProperty("location");
      }
    });

    it("should include pagination information", async () => {
      const res = await request(app).get("/events");

      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toHaveProperty("current");
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("count");
      expect(res.body.pagination).toHaveProperty("totalEvents");
    });
  });
});
