import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { lambdaHandler } from '../../app';
import { expect, describe, it, beforeEach } from '@jest/globals';

const ddbMock = mockClient(DynamoDBDocumentClient);

const baseEvent = {
    requestContext: {
        authorizer: { jwt: { claims: { sub: 'test-sub-1234' } } },
    },
    pathParameters: { taskId: 'task-abc' },
};

describe('Unit test for update-task handler', function () {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('updates the task and returns 200 with the new attributes', async () => {
        const updatedTask = {
            PK: 'USER#test-sub-1234',
            SK: 'TASK#task-abc',
            title: 'Título actualizado',
            status: 'en progreso',
        };
        ddbMock.on(UpdateCommand).resolves({ Attributes: updatedTask });

        const event = {
            ...baseEvent,
            body: JSON.stringify({ title: 'Título actualizado', status: 'en progreso' }),
        };
        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(updatedTask);
    });

    it('returns 400 when no valid fields are sent', async () => {
        const event = { ...baseEvent, body: JSON.stringify({ notAllowed: 'x' }) };

        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(400);
        expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(0);
    });

    it('returns 404 when the task does not exist', async () => {
        const error = Object.assign(new Error('conditional check failed'), {
            name: 'ConditionalCheckFailedException',
        });
        ddbMock.on(UpdateCommand).rejects(error);

        const event = { ...baseEvent, body: JSON.stringify({ title: 'x' }) };
        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(404);
    });
});