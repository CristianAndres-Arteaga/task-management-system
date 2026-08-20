import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const sub = event.requestContext.authorizer.jwt.claims.sub as string;
    const status = event.queryStringParameters?.status;
   

    const result = await docClient.send(new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `USER#${sub}`,
            ":skPrefix": "TASK#",
        },
    }));
    let tasks = result.Items ?? [];
    if (status) {
        tasks = tasks.filter((item) => item.status === status);
    }

    const response = {
        headers: { "Content-Type": "application/json" },
        statusCode: 200,
        body: JSON.stringify(tasks),
    };

    console.log("Respondiendo con:", JSON.stringify(response));

    return response;
};