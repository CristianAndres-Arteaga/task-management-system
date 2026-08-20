import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ALLOWED_FIELDS = ["title", "description", "status"];

export const lambdaHandler = async (event: any) => {
  try {
    const sub = event.requestContext.authorizer.jwt.claims.sub;
    const taskId = event.pathParameters?.taskId;

    if (!taskId) {
      return {
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
        body: JSON.stringify({ message: "taskId es requerido en el path" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const updateFields = Object.keys(body).filter((key) =>
      ALLOWED_FIELDS.includes(key)
    );

    if (updateFields.length === 0) {
      return {
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
        body: JSON.stringify({
          message: "No se enviaron campos válidos para actualizar",
        }),
      };
    }

    const expressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    for (const field of updateFields) {
      expressionParts.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = body[field];
    }

    const command = new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: `USER#${sub}`,
        SK: `TASK#${taskId}`,
      },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(PK)",
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);

    return {
      headers: { "Content-Type": "application/json" },
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        headers: { "Content-Type": "application/json" },
        statusCode: 404,
        body: JSON.stringify({ message: "Tarea no encontrada" }),
      };
    }

    console.error(error);
    return {
      headers: { "Content-Type": "application/json" },
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno" }),
    };
  }
};