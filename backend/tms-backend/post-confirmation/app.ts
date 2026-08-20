import { PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (
    event: PostConfirmationTriggerEvent
): Promise<PostConfirmationTriggerEvent> => {
    const {sub, email } = event.request.userAttributes;

    await docClient.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                PK: `USER#${sub}`,
                SK: "PROFILE",
                email,
                createdAt: new Date().toISOString(),
            },
        })
    );
    return event;
};  