import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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


    const command = new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key:{
            PK: `USER#${sub}`,
            SK: `TASK#${taskId}`,
        },
        ConditionExpression: "attribute_exists(PK)",
    });
    await docClient.send(command);

    return {
      statusCode: 204,
      body: "",
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