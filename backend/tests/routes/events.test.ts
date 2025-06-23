import request from "supertest";
import app from "../../src/index";
import mongoose from "mongoose";

describe("Events API", () => {
  let authToken: string;

  beforeAll(async () => {
    await request(app).post("/users/register").send({
      name: "Test User",
      email: "testuser@events.com",
      password: "test1234",
    });

    const loginRes = await request(app).post("/users/login").send({
      email: "testuser@events.com",
      password: "test1234",
    });

    authToken = loginRes.body.token;
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
      expect(res.body.pagination).toMatchObject({
        current: expect.any(Number),
        total: expect.any(Number),
        count: expect.any(Number),
        totalEvents: expect.any(Number),
      });
    });
  });

  describe("POST /events", () => {
    let token: string;

    beforeAll(async () => {
      await request(app).post("/users/register").send({
        name: "Nana",
        email: "nana@gmail.com",
        password: "nananana",
      });

      const loginRes = await request(app).post("/users/login").send({
        email: "nana@gmail.com",
        password: "nananana",
      });

      token = loginRes.body.token;
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
      expect(res.body).toMatchObject({
        title: "Test Event from Jest",
        location: "Batumi",
        date: "2025-06-30",
      });
    });
  });

  describe("PUT /events/:id", () => {
    let token: string;
    let eventId: string;

    beforeAll(async () => {
      await request(app).post("/users/register").send({
        name: "Test User",
        email: "testuser@events.com",
        password: "test1234",
      });

      const loginRes = await request(app).post("/users/login").send({
        email: "testuser@events.com",
        password: "test1234",
      });
      token = loginRes.body.token;

      const createRes = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${token}`)
        .field("title", "Original Title")
        .field("date", "2025-06-30")
        .field("location", "Tbilisi");

      eventId = createRes.body._id;
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app)
        .put(`/events/${eventId}`)
        .send({ title: "Unauthorized" });
      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid event ID", async () => {
      const res = await request(app)
        .put("/events/invalid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Bad ID" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid event ID");
    });

    it("should return 404 for non-existent event", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/events/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Not Found" });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should update the event when valid token and data are provided", async () => {
      const res = await request(app)
        .put(`/events/${eventId}`)
        .set("Authorization", `Bearer ${token}`)
        .field("title", "Updated Title")
        .field("date", "2025-07-01")
        .field("location", "Kutaisi");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Title");
      expect(res.body).toHaveProperty("location", "Kutaisi");
    });
  });

  describe("DELETE /events/:id", () => {
    let deleteToken: string;
    let eventIdToDelete: string;

    beforeAll(async () => {
      const email = "deleter@events.com";

      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.collection("users").deleteOne({ email });
      }

      await request(app).post("/users/register").send({
        name: "Deleter User",
        email,
        password: "deleter123",
      });

      const loginRes = await request(app).post("/users/login").send({
        email,
        password: "deleter123",
      });

      deleteToken = loginRes.body.token;

      const createRes = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${deleteToken}`)
        .send({
          title: "Event to Delete",
          date: "2025-06-25",
          location: "Deleteville",
          categoryIds: JSON.stringify([]),
        });

      expect(createRes.status).toBe(201);
      eventIdToDelete = createRes.body._id;
      expect(eventIdToDelete).toBeTruthy();
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).delete(`/events/${eventIdToDelete}`);
      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid event ID", async () => {
      const res = await request(app)
        .delete("/events/invalid-id")
        .set("Authorization", `Bearer ${deleteToken}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid event ID");
    });

    it("should return 404 if event does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/events/${nonExistentId}`)
        .set("Authorization", `Bearer ${deleteToken}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should delete the event when valid token and ID are provided", async () => {
      const res = await request(app)
        .delete(`/events/${eventIdToDelete}`)
        .set("Authorization", `Bearer ${deleteToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Event deleted successfully");
    });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db!;
      await db.collection("events").deleteMany({
        title: { $regex: /(Test Event|Event to Delete|Updated Title)/ },
      });
      await db.collection("users").deleteMany({
        email: {
          $in: ["testuser@events.com", "deleter@events.com", "nana@gmail.com"],
        },
      });
    }
    await mongoose.connection.close();
  });
});
