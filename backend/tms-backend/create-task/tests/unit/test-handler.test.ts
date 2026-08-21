import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it, beforeEach } from '@jest/globals';

const ddbMock = mockClient(DynamoDBDocumentClient);

const baseEvent = {
    version: '2.0',
    routeKey: 'POST /tasks',
    rawPath: '/tasks',
    rawQueryString: '',
    headers: {},
    requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        domainName: 'id.execute-api.us-east-2.amazonaws.com',
        domainPrefix: 'id',
        http: {
            method: 'POST',
            path: '/tasks',
            protocol: 'HTTP/1.1',
            sourceIp: '127.0.0.1',
            userAgent: 'jest-test',
        },
        requestId: 'test-request-id',
        routeKey: 'POST /tasks',
        stage: '$default',
        time: '01/Jan/2024:00:00:00 +0000',
        timeEpoch: 1704067200000,
        authorizer: {
            jwt: { claims: { sub: 'test-sub-1234' }, scopes: [] },
        },
    },
    isBase64Encoded: false,
} as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;

describe('Unit test for create-task handler', function () {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('creates a task and returns 201 with the created item', async () => {
        ddbMock.on(PutCommand).resolves({});

        const event = {
            ...baseEvent,
            body: JSON.stringify({ title: 'Comprar pan', description: 'Antes de las 8pm' }),
        };

        const result: any = await lambdaHandler(event);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toEqual(201);
        expect(body.title).toEqual('Comprar pan');
        expect(body.description).toEqual('Antes de las 8pm');
        expect(body.status).toEqual('pendiente');
        expect(body.PK).toEqual('USER#test-sub-1234');
        expect(body.SK).toEqual(`TASK#${body.taskId}`);
    });

    it('returns 400 when title is missing', async () => {
        const event = {
            ...baseEvent,
            body: JSON.stringify({ description: 'Sin título' }),
        };

        const result: any = await lambdaHandler(event);

        expect(result.statusCode).toEqual(400);
        expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0);
    });
});