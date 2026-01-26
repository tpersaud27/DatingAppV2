import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { createRemoteJWKSet, jwtVerify } from "jose";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Cache JWKS resolver across invocations (Lambda container reuse)
let jwks = null;

export const handler = async (event) => {
  const routeKey = event.requestContext?.routeKey;

  try {
    switch (routeKey) {
      case "$connect":
        return await onConnect(event);
      case "$disconnect":
        return await onDisconnect(event);
      default:
        return { statusCode: 400, body: `Unknown route: ${routeKey}` };
    }
  } catch (err) {
    console.error("WS_HANDLER_ERROR", { routeKey, err });
    return { statusCode: 500, body: "Internal Server Error" };
  }
};

async function onConnect(event) {
  const tableName = process.env.CONNECTIONS_TABLE;
  const ttlSeconds = Number(process.env.CONNECTION_TTL_SECONDS ?? "172800"); // 2 days
  const connectionId = event.requestContext.connectionId;

  console.log("Calling onConnect");
  console.log("routeKey", event.requestContext.routeKey);
  console.log("connectionId", connectionId);

  const token = extractToken(event);
  if (!token) return { statusCode: 401, body: "Missing token" };

  const userId = await verifyCognitoIdTokenAndGetSub(token);
  if (!userId) return { statusCode: 401, body: "Unauthorized" };

  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = nowSec + ttlSeconds;

  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId, // this is Cognito sub (your AppUser.Id)
        connectionId,
        connectedAt: nowSec,
        ttl,
      },
    }),
  );

  return { statusCode: 200, body: "Connected" };
}

async function onDisconnect(event) {
  const tableName = process.env.CONNECTIONS_TABLE;
  const indexName = process.env.CONNECTION_ID_INDEX;
  const connectionId = event.requestContext.connectionId;

  console.log("Calling onDisconnect");
  console.log("routeKey", event.requestContext.routeKey);
  console.log("connectionId", connectionId);

  const res = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "connectionId = :c",
      ExpressionAttributeValues: { ":c": connectionId },
      Limit: 1,
    }),
  );

  const item = res.Items?.[0];
  if (!item) return { statusCode: 200, body: "Already disconnected" };

  await ddb.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId: item.userId, connectionId: item.connectionId },
    }),
  );

  return { statusCode: 200, body: "Disconnected" };
}

/** Pull token from query string: ?token=... */
function extractToken(event) {
  return event?.queryStringParameters?.token ?? null;
}

/**
 * Verify Cognito ID token and return `sub`
 * Required env vars:
 *  - COGNITO_USER_POOL_ID (e.g. us-east-1_XXXX)
 *  - COGNITO_CLIENT_ID    (App client id shown in your event as `aud`)
 *  - AWS_REGION           (or hardcode "us-east-1")
 */
async function verifyCognitoIdTokenAndGetSub(token) {
  const region = process.env.COGNITO_REGION || "us-east-1";
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    console.error("Missing env vars: COGNITO_USER_POOL_ID / COGNITO_CLIENT_ID");
    return null;
  }

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });

    // Make sure this is an ID token
    if (payload.token_use !== "id") return null;

    return payload.sub ?? null;
  } catch (e) {
    console.error("JWT_VERIFY_FAILED", e?.message ?? e);
    return null;
  }
}
