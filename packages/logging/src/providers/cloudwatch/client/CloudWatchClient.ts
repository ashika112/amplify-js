// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): PENDING complete implementation of cloudWatchProvider
import {
	CloudWatchLogsClient,
	InputLogEvent,
	PutLogEventsCommand,
	PutLogEventsCommandInput,
	RejectedLogEventsInfo,
} from '@aws-sdk/client-cloudwatch-logs';
import { LogLevel, LogParams } from '../../../types';
import { CloudWatchConfig, CloudWatchProvider } from '../types';
import { createQueuedStorage, QueuedStorage } from '@aws-amplify/core';
import { NetworkConnectionMonitor } from '@aws-amplify/core/internals/utils';
import { getDefaultStreamName } from '../utils';
import { resolveCredentials } from '../../../utils/resolveCredentials';
// TODO: Fix this type import
import { QueuedItem } from '@aws-amplify/core/dist/esm/utils/queuedStorage/types';

import {
	BASE_BUFFER_SIZE,
	DEFAULT_LOG_LEVEL,
	FLUSH_INTERVAL_IN_SECONDS,
	LOCAL_STORE_SIZE_IN_MB,
} from '../utils/constants';
import { convertToInputLogEvent, isLogBatchReady } from '../utils/utils';

let cloudWatchConfig: CloudWatchConfig;
let queuedStorage: QueuedStorage;
let cloudWatchSDKClient: CloudWatchLogsClient;
let networkMonitor: NetworkConnectionMonitor;
let syncing = false;

const defaultConfig = {
	enable: true,
	localStoreMaxSizeInMB: LOCAL_STORE_SIZE_IN_MB,
	flushIntervalInSeconds: FLUSH_INTERVAL_IN_SECONDS,
	loggingConstraints: {
		defaultLogLevel: DEFAULT_LOG_LEVEL,
	},
};

export const cloudWatchProvider: CloudWatchProvider = {
	/**
	 * set the initial configuration
	 * @internal
	 */
	configure: async (config: CloudWatchConfig) => {
		cloudWatchConfig = { ...defaultConfig, ...config };
		const { region } = cloudWatchConfig;

		// TODO: Test credentials change
		cloudWatchSDKClient = new CloudWatchLogsClient({
			region,
			credentials: resolveCredentials,
		});

		queuedStorage = createQueuedStorage();
		networkMonitor = new NetworkConnectionMonitor();
		// TODO: start a timer for flushIntervalInSeconds and start the sync to CW -- call startSyncIfNotInProgress
	},
	/**
	 * logs are enqueued to local store and persisted
	 * logs are periodically flushed from store and send to CloudWatch
	 * @internal
	 */
	log: (input: LogParams) => {
		if (!_isLoggable(input)) {
			return;
		}
		const { namespace, category, logLevel, message } = input;
		const categoryPrefix = category ? `/${category}` : '';
		const prefix = `[${logLevel}] ${namespace}${categoryPrefix}`;

		// Final log format looks like this: `[${logLevel}] ${namespace}/${category}: ${message}`
		const content = `${prefix}: ${message}`;

		// Store log with log rotation enabled if it's full
		queuedStorage.add(
			{
				content,
				timestamp: new Date().getTime().toString(),
			},
			{
				dequeueBeforeEnqueue: queuedStorage.isFull(
					cloudWatchConfig.localStoreMaxSizeInMB ??
						defaultConfig.localStoreMaxSizeInMB
				),
			}
		);
		// TODO: call startSyncIfNotInProgress
	},

	/**
	 * send locally persisted logs to CloudWatch on demand
	 * @internal
	 */
	flushLogs: async (): Promise<void> => {
		await _startSyncIfNotInProgress();
		return Promise.resolve();
	},
	/**
	 * enable cloudwatch provider
	 * @internal
	 */
	enable: (): void => {
		cloudWatchConfig.enable = true;
	},
	/**
	 * disable cloudwatch provider
	 * @internal
	 */
	disable: (): void => {
		cloudWatchConfig.enable = false;
	},
};

export const _startSyncIfNotInProgress = async () => {
	if (!syncing) {
		syncing = true;

		const queuedItems = await queuedStorage.peekAll();
		let logEvents: InputLogEvent[] = [];
		let logQueues: QueuedItem[] = [];
		let totalBatchSize = 0;

		if (!queuedItems.length) {
			return;
		}

		for (const currentItem of queuedItems) {
			const currentLogEvent: InputLogEvent =
				convertToInputLogEvent(currentItem);
			const currentLogSize =
				(currentLogEvent.message?.length ?? 0) + BASE_BUFFER_SIZE;

			if (isLogBatchReady(logEvents, currentLogEvent, totalBatchSize)) {
				// call sendToCloudWatch && delete from storage
				totalBatchSize = 0;
				logEvents = [];
				logQueues = [];
			}
			totalBatchSize += currentLogSize;
			logEvents.push(currentLogEvent);
			logQueues.push(currentItem);
		}

		syncing = false;
	}
};

async function _sendToCloudWatch(
	logEvents: InputLogEvent[],
	logQueues: QueuedItem[]
) {
	const { logGroupName } = cloudWatchConfig;
	// TODO: how can cx give their own logStreamName?
	const logStreamName = await getDefaultStreamName();
	const logBatch: PutLogEventsCommandInput = {
		logEvents,
		logGroupName,
		logStreamName,
	};

	networkMonitor.enableNetworkMonitoringFor(async () => {
		let rejectedLogEventsInfo;
		try {
			rejectedLogEventsInfo = (
				await cloudWatchSDKClient.send(new PutLogEventsCommand(logBatch))
			).rejectedLogEventsInfo;
			await handleRejectedLogEvents(logQueues, rejectedLogEventsInfo);
		} catch (e) {
			// TODO: Should we log to console or dispatch a hub event?
		}
	});
}

// Exporting this function for testing purposes
export async function handleRejectedLogEvents(
	batchedLogs: QueuedItem[],
	rejectedLogEventsInfo?: RejectedLogEventsInfo
) {
	// If there is tooNewLogEvents delete every log until then
	if (rejectedLogEventsInfo?.tooNewLogEventStartIndex) {
		await queuedStorage.delete(
			batchedLogs.slice(rejectedLogEventsInfo.tooNewLogEventStartIndex)
		);
		// If there is no tooNewLogEvents then others are either tooOld, expired or successfully logged so delete them from storage
	} else {
		await queuedStorage.delete(batchedLogs);
		return;
	}

	// TODO:
	// 1. Needs design clarification on how to handle tooNewLogEventStartIndex -- For now following the Android impl of keeping them in local memory(cache).
	// 2. Retry logic for the same needs to be implemented
}

function _isLoggable(log: LogParams): boolean {
	// TODO: Log filtering function
	return true;
}
