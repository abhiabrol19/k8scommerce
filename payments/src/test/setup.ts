import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[] | undefined;
}

jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer;

process.env.STRIPE_KEY = 'sk_test_51PD3va2NWZ8UtO3Zsfktcy0JHqeURn3QiBRHAtcrlWRPx2EoDN24fd4t7zC38xInQAHcxamXFcmWm1ntTSdkADq5004dXuJY5a';

beforeAll(async () => {
  process.env.JWT_KEY = 'test';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});



beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }

  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  //create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session
  const session = { jwt: token };

  //turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a string thats the cookie with the encoded data
  return [`session=${base64}`];

}

