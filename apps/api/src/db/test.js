import db from "./index.js";
import { sql } from "drizzle-orm";

async function test() {
    try {

        await db.execute(sql`SELECT 1`);

        console.log("Database Connected");

    } catch (err) {

        console.log(err);

    }
}

test();