// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageOptions,
} from './options';

/** @deprecated Use {@link StorageOperationInputPath} instead. */
export interface StorageOperationInputKey {
	/** @deprecated Use `path` instead. */
	key: string;
}
export interface StorageOperationInputPath {
	path: string | (({ identityId }: { identityId?: string }) => string);
}
export interface StorageOperationOptions<Options> {
	options?: Options;
}

/** @deprecated Use {@link StorageDownloadDataInputPath} instead. */
export type StorageDownloadDataInputKey<Options extends StorageOptions> =
	StorageOperationInputKey & StorageOperationOptions<Options>;

export type StorageDownloadDataInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptions<Options>;

// TODO: This needs to be removed after refactor of all storage APIs
export interface StorageOperationInput<Options extends StorageOptions> {
	key: string;
	options?: Options;
}

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

export type StorageUploadDataInput<Options extends StorageOptions> =
	StorageOperationInput<Options> & {
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
