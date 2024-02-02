// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	convertToInputLogEvent,
	getDefaultStreamName,
	isLogBatchReady,
	truncateString,
} from '../../../../src/providers/cloudwatch/utils';
import { fetchAuthSession } from '@aws-amplify/core';
import { QueuedItem } from '@aws-amplify/core/dist/esm/utils/queuedStorage/types';

const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const testDeviceId = 'test-device-id-1';

const mockLogSize = 100;
const mockBatchSize = 11;
const mockMaxLogs = 11;
const mockTimeSpan = 1200;

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	getDeviceId: jest.fn(() => testDeviceId),
}));

jest.mock('../../../../src/providers/cloudwatch/utils/constants', () => ({
	...jest.requireActual('../../../../src/providers/cloudwatch/utils/constants'),
	MAX_NUMBER_OF_LOGS_IN_BATCH: 10,
	MAX_BATCH_SIZE_IN_BYTES: 10,
	MAX_LOG_EVENTS_TIME_SPAN_IN_MILLISECONDS: 1000,
	MAX_LOG_EVENT_SIZE: 100,
}));

describe('CloudWatch Utils: ', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getDefaultStreamName', () => {
		it('should return a log stream name for a guest', async () => {
			mockFetchAuthSession.mockImplementationOnce(() => {
				return { userSub: undefined };
			});
			expect(await getDefaultStreamName()).toContain(`${testDeviceId}.guest`);
		});
		it('should return a log stream name for a logged in user', async () => {
			const loggedInUserSub = 'test-logged-in-user-sub';
			mockFetchAuthSession.mockImplementationOnce(() => {
				return { userSub: loggedInUserSub };
			});
			expect(await getDefaultStreamName()).toContain(
				`${testDeviceId}.${loggedInUserSub}`
			);
		});
	});

	describe('truncateString', () => {
		it('should return the string unmodified if shorter than the maximum length', () => {
			const str = 'This is a short string';
			const result = truncateString(str);
			expect(result).toBe(str);
		});

		it('should return the string truncated if it is longer than the maximum length', () => {
			const str = 'a'.repeat(mockLogSize + 10);
			const result = truncateString(str);
			expect(result.length).toBe(mockLogSize - 8);
		});
	});

	describe('convertToInputLogEvent', () => {
		it('should return an InputLogEvent with the content truncated and the timestamp parsed', () => {
			const queuedItem: QueuedItem = {
				id: 123,
				content: 'a'.repeat(mockLogSize + 10),
				timestamp: '2022-01-01T00:00:00Z',
				bytesSize: 123,
			};

			const result = convertToInputLogEvent(queuedItem);

			expect(result).toEqual(
				expect.objectContaining({
					message: expect.any(String),
					timestamp: expect.any(Number),
				})
			);

			const totalEventSize = result.message?.length ?? 0 + 8;
			expect(totalEventSize).toBeLessThanOrEqual(mockLogSize);
			expect(result.message).toBe(truncateString(queuedItem.content));
			expect(result.timestamp).toBe(Date.parse(queuedItem.timestamp));
		});
	});

	describe('isLogBatchReady', () => {
		it('should return true if the batch size is exceeded', () => {
			const logEvents = [{ message: 'a', timestamp: 1 }];
			const currentLogEvent = { message: 'b', timestamp: 2 };

			const result = isLogBatchReady(
				logEvents,
				currentLogEvent,
				mockBatchSize + 1
			);

			expect(result).toBe(true);
		});

		it('should return true if the log count is exceeded', () => {
			const logEvents = new Array(mockMaxLogs + 1).fill({
				message: 'a',
				timestamp: 1,
			});
			const currentLogEvent = { message: 'b', timestamp: 2 };

			const result = isLogBatchReady(logEvents, currentLogEvent, 0);

			expect(result).toBe(true);
		});

		it('should return true if the time span is exceeded', () => {
			const logEvents = [
				{ message: 'a', timestamp: 1 },
				{
					message: 'b',
					timestamp: mockTimeSpan,
				},
			];

			const result = isLogBatchReady(logEvents, logEvents[1], 0);

			expect(result).toBe(true);
		});

		it('should return false if no conditions are met', () => {
			const logEvents = [{ message: 'a', timestamp: 1 }];
			const currentLogEvent = { message: 'b', timestamp: 2 };
			const totalBatchSize = 0;

			const result = isLogBatchReady(
				logEvents,
				currentLogEvent,
				totalBatchSize
			);

			expect(result).toBe(false);
		});
	});
});
