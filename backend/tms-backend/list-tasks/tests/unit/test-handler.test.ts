import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it, beforeEach } from '@jest/globals';

const ddbMock = mockClient(DynamoDBDocumentClient);

const baseEvent = {
    requestContext: {
        authorizer: { jwt: { claims: { sub: 'test-sub-1234' } } },
    },
    queryStringParameters: null,
} as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;

const fakeTasks = [
    { PK: 'USER#test-sub-1234', SK: 'TASK#1', taskId: '1', title: 'Tarea 1', status: 'pendiente' },
    { PK: 'USER#test-sub-1234', SK: 'TASK#2', taskId: '2', title: 'Tarea 2', status: 'completada' },
];

describe('Unit test for list-tasks handler', function () {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('returns all tasks when no status filter is given', async () => {
        ddbMock.on(QueryCommand).resolves({ Items: fakeTasks });

        const result: any = await lambdaHandler(baseEvent);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toEqual(200);
        expect(body).toHaveLength(2);
    });

    it('filters tasks by status when provided', async () => {
        ddbMock.on(QueryCommand).resolves({ Items: fakeTasks });

        const event = { ...baseEvent, queryStringParameters: { status: 'pendiente' } };
        const result: any = await lambdaHandler(event);
        const body = JSON.parse(result.body);

        expect(body).toHaveLength(1);
        expect(body[0].status).toEqual('pendiente');
    });
});