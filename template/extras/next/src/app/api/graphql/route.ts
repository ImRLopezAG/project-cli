import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { buildSchema } from "drizzle-graphql";
import { db } from "~server/db";

const { schema } = buildSchema(db, {
	mutations: false,
});

const handler = startServerAndCreateNextHandler(
	new ApolloServer({
		schema,
	}),
);

export { handler as GET, handler as POST };
