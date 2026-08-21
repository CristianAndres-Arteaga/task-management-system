import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { lambdaHandler } from '../../app';
import { expect, describe, it, beforeEach } from '@jest/globals';

const ddbMock = mockClient(DynamoDBDocumentClient);

const baseEvent = {
    requestContext: {
        authorizer: { jwt: { claims: { sub: 'test-sub-1234' } } },
    },
    pathParameters: { taskId: 'task-abc' },
};

describe('Unit test for delete-task handler', function () {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('deletes the task and returns 204', async () => {
        ddbMock.on(DeleteCommand).resolves({});

        const result = await lambdaHandler(baseEvent);

        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual('');
    });

    it('returns 400 when taskId is missing from the path', async () => {
        const event = { ...baseEvent, pathParameters: {} };

        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(400);
        expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(0);
    });

    it('returns 404 when the task does not exist', async () => {
        const error = Object.assign(new Error('conditional check failed'), {
            name: 'ConditionalCheckFailedException',
        });
        ddbMock.on(DeleteCommand).rejects(error);

        const result = await lambdaHandler(baseEvent);

        expect(result.statusCode).toEqual(404);
    });
});