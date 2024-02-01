// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from '../../../types';

export const DEFAULT_LOG_LEVEL: LogLevel = 'INFO';

export const LOCAL_STORE_SIZE_IN_MB = 5;
export const FLUSH_INTERVAL_IN_SECONDS = 60;

// Cloudwatch Log constraints
export const MAX_NUMBER_OF_LOGS_IN_BATCH = 10_000;
export const MAX_BATCH_SIZE_IN_BYTES = 1048576;
export const MAX_LOG_EVENT_SIZE = 256_000;
export const MAX_LOG_EVENTS_TIME_SPAN_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const BASE_BUFFER_SIZE = 26;
