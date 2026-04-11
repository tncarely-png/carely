import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("69da3a96000d474efae3");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Ping to verify setup
client.ping();

export { client, account, databases, storage };
