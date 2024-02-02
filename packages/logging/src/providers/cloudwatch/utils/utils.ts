// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { getDeviceId } from '@aws-amplify/core/internals/utils';
import {
	InputLogEvent,
	RejectedLogEventsInfo,
} from '@aws-sdk/client-cloudwatch-logs';
import {
	MAX_BATCH_SIZE_IN_BYTES,
	MAX_LOG_EVENTS_TIME_SPAN_IN_MILLISECONDS,
	MAX_LOG_EVENT_SIZE,
	MAX_NUMBER_OF_LOGS_IN_BATCH,
} from './constants';
// TODO: Fix this type import
import { QueuedItem } from '@aws-amplify/core/dist/esm/utils/queuedStorage/types';

const GUEST_USER_ID_FOR_LOG_STREAM_NAME: string = 'guest';

export async function getDefaultStreamName() {
	const { userSub } = await fetchAuthSession();
	const userId = userSub ?? GUEST_USER_ID_FOR_LOG_STREAM_NAME;
	const deviceId = await getDeviceId();
	const dateNow = new Date().toISOString().split('T')[0];
	return `${dateNow}.${deviceId}.${userId}`;
}

export function parseRejectedLogEvents(
	rejectedLogEventsInfo: RejectedLogEventsInfo
) {
	const {
		tooOldLogEventEndIndex,
		tooNewLogEventStartIndex,
		expiredLogEventEndIndex,
	} = rejectedLogEventsInfo;
	let oldOrExpiredLogsEndIndex;
	if (tooOldLogEventEndIndex) {
		oldOrExpiredLogsEndIndex = tooOldLogEventEndIndex;
	}
	if (expiredLogEventEndIndex) {
		oldOrExpiredLogsEndIndex = oldOrExpiredLogsEndIndex
			? Math.max(oldOrExpiredLogsEndIndex, expiredLogEventEndIndex)
			: expiredLogEventEndIndex;
	}
	return { oldOrExpiredLogsEndIndex, tooNewLogEventStartIndex };
}

export const truncateString = (str: string) => {
	const maxLength = MAX_LOG_EVENT_SIZE - 8;
	if (str.length > maxLength) {
		return str.slice(0, maxLength);
	}
	return str;
};

export const convertToInputLogEvent = (
	queuedItem: QueuedItem
): InputLogEvent => {
	return {
		// Truncate message so that logEvent size is less than 256 KB
		message: truncateString(queuedItem.content),
		timestamp: Date.parse(queuedItem.timestamp),
	};
};

export const isLogBatchReady = (
	logEvents: InputLogEvent[],
	currentLogEvent: InputLogEvent,
	totalBatchSize: number
): boolean => {
	const isBatchSizeExceeded = totalBatchSize >= MAX_BATCH_SIZE_IN_BYTES;
	const isLogCountExceeded = logEvents.length >= MAX_NUMBER_OF_LOGS_IN_BATCH;
	const isTimeSpanExceeded =
		logEvents.length > 1 &&
		(currentLogEvent.timestamp ?? 0) - (logEvents[0].timestamp ?? 0) >=
			MAX_LOG_EVENTS_TIME_SPAN_IN_MILLISECONDS;

	return isBatchSizeExceeded || isLogCountExceeded || isTimeSpanExceeded;
};
