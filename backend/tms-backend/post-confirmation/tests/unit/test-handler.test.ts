import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it, beforeEach } from '@jest/globals';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Unit test for post-confirmation handler', function () {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('creates a user profile item and returns the event unchanged', async () => {
        ddbMock.on(PutCommand).resolves({});

        const event: PostConfirmationTriggerEvent = {
            version: '1',
            region: 'us-east-2',
            userPoolId: 'us-east-2_rHEVgHGnb',
            userName: 'testuser',
            callerContext: {
                awsSdkVersion: 'aws-sdk-unknown-unknown',
                clientId: 'testclientid',
            },
            triggerSource: 'PostConfirmation_ConfirmSignUp',
            request: {
                userAttributes: {
                    sub: 'test-sub-1234',
                    email: 'test@example.com',
                },
            },
            response: {},
        };

        const result = await lambdaHandler(event);

        expect(result).toEqual(event);

        const calls = ddbMock.commandCalls(PutCommand);
        expect(calls).toHaveLength(1);
        expect(calls[0].args[0].input.Item).toMatchObject({
            PK: 'USER#test-sub-1234',
            SK: 'PROFILE',
            email: 'test@example.com',
        });
    });
});