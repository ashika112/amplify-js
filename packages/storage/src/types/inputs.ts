// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageOptions,
} from './options';

export interface StorageOperationInput<Options extends StorageOptions> {
	key: string;
	options?: Options;
}

export type StorageOperationInputPath<Options> = {
	path: string;
	options?: Options;
};

// export type StorageOperationInputNew<Options> =
// 	| StorageOperationInput<Options extends StorageOptions>
// 	| StorageOperationInputPath<Options>;

export type StorageGetPropertiesInput<Options extends StorageOptions> =
	StorageOperationInput<Options>;

export interface StorageRemoveInput<Options extends StorageOptions> {
	key: string;
	options?: Options;
}

export interface StorageListInput<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> {
	prefix?: string;
	options?: Options;
}

export type StorageGetUrlInput<Options extends StorageOptions> =
	StorageOperationInput<Options>;

export type StorageDownloadDataInput<Options extends StorageOptions> =
	StorageOperationInput<Options>;

export type StorageUploadDataInput<Options> =
	StorageOperationInputPath<Options> & {
		data: StorageUploadDataPayload;
	};

export interface StorageCopyInput<
	SourceOptions extends StorageOptions,
	DestinationOptions extends StorageOptions,
> {
	source: SourceOptions;
	destination: DestinationOptions;
}

/**
 * The data payload type for upload operation.
 */
export type StorageUploadDataPayload =
	| Blob
	| ArrayBufferView
	| ArrayBuffer
	| string;
