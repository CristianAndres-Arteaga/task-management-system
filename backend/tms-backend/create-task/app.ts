import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const sub = event.requestContext.authorizer.jwt.claims.sub as string;

    if (!event.body) {
        return {
            headers: { "Content-Type": "application/json" },
            statusCode: 400,
            body: JSON.stringify({ message: "El body es requerido" }),
        };
    }

    const { title, description } = JSON.parse(event.body);

    if (!title) {
        return {
            headers: { "Content-Type": "application/json" },
            statusCode: 400,
            body: JSON.stringify({ message: "El campo 'title' es requerido" }),
        };
    }

    const taskId = randomUUID();
    const task = {
        PK: `USER#${sub}`,
        SK: `TASK#${taskId}`,
        taskId,
        title,
        description: description ?? "",
        status: "pendiente",
        createdAt: new Date().toISOString(),
    };

    await docClient.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: task,
        })
    );

    const response = {
        headers: { "Content-Type": "application/json" },
        statusCode: 201,
        body: JSON.stringify(task),
    };

    console.log("Respondiendo con:", JSON.stringify(response));

    return response;
};