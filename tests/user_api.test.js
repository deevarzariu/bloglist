const { test, after, before, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");

const app = require("../app");
const User = require("../models/user");
const helper = require("../utils/api_helper");
const bcryptjs = require("bcryptjs");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  for (let user of helper.initialUsers) {
    const passwordHash = await bcryptjs.hash("1234", 10);
    const userObj = new User({ ...user, passwordHash });
    await userObj.save();
  }
});

describe("users API", () => {
  test("successfully creates a user with valid username and password", async () => {
    const userToCreate = {
      username: "new-user",
      password: "abcd",
    };
    await api.post("/api/users").send(userToCreate).expect(201);

    const allUsers = await helper.getAllUsers();
    const allUsernames = allUsers.map((user) => user.username);

    assert.strictEqual(allUsers.length, helper.initialUsers.length + 1);
    assert.strictEqual(allUsernames.includes("new-user"), true);
  });

  test("fails to create a user with no username", async () => {
    const userToCreate = {
      password: "abcd",
    };
    await api.post("/api/users").send(userToCreate).expect(400);

    const allUsers = await helper.getAllUsers();
    assert.strictEqual(allUsers.length, helper.initialUsers.length);
  });

  test("fails to create a user with no password", async () => {
    const userToCreate = {
      username: "default-username",
    };
    await api.post("/api/users").send(userToCreate).expect(400);

    const allUsers = await helper.getAllUsers();
    assert.strictEqual(allUsers.length, helper.initialUsers.length);
  });

  test("fails to create a user with a non-unique username", async () => {
    const userToCreate = {
      username: "root",
      password: "abcd",
    };
    await api.post("/api/users").send(userToCreate).expect(400);

    const allUsers = await helper.getAllUsers();
    assert.strictEqual(allUsers.length, helper.initialUsers.length);
  });

  test("fails to create a user with a username shorter than 3 characters", async () => {
    const userToCreate = {
      username: "ab",
      password: "abcd",
    };
    await api.post("/api/users").send(userToCreate).expect(400);

    const allUsers = await helper.getAllUsers();
    assert.strictEqual(allUsers.length, helper.initialUsers.length);
  });

  test("fails to create a user with a password shorter than 3 characters", async () => {
    const userToCreate = {
      username: "abcde",
      password: "a",
    };
    await api.post("/api/users").send(userToCreate).expect(400);

    const allUsers = await helper.getAllUsers();
    assert.strictEqual(allUsers.length, helper.initialUsers.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
