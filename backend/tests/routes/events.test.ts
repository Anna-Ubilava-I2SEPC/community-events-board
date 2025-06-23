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

  describe("POST /events", () => {
    let token: string;

    beforeAll(async () => {
      // Log in test user to get token
      const loginRes = await request(app).post("/users/login").send({
        email: "nana@gmail.com",
        password: "nananana",
      });

      token = loginRes.body.token;
      expect(token).toBeTruthy();
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      const res = await request(app).post("/events").send({
        title: "Unauthorized Event",
        date: "2025-06-30",
        location: "Tbilisi",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty(
        "message",
        "No authentication token, access denied"
      );
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 if categoryIds is not a valid array", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Bad Categories",
          date: "2025-06-30",
          location: "Kutaisi",
          categoryIds: "not-an-array",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should create a new event when valid data is provided", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Event from Jest",
          date: "2025-06-30",
          location: "Batumi",
          description: "This is a test event created via Jest",
          categoryIds: JSON.stringify([]),
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("title", "Test Event from Jest");
      expect(res.body).toHaveProperty("location", "Batumi");
      expect(res.body).toHaveProperty("date", "2025-06-30");
      expect(res.body).toHaveProperty("createdByName");
    });
  });
});
