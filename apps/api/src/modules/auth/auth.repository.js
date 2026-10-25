import db from "../../db/index.js";
import { users } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email) {

    const result = await db

        .select()

        .from(users)

        .where(eq(users.email, email));

    return result[0];

}

export async function createUser(data) {

    const result = await db

        .insert(users)

        .values(data)

        .returning();

    return result[0];

}