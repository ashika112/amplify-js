// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';
import { SigningOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { TransferProgressEvent } from '../../../types';
import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageSubpathStrategy,
} from '../../../types/options';

export interface BucketInfo {
	bucketName: string;
	region: string;
}

export type StorageBucket = string | BucketInfo;
interface CommonOptions {
	/**
	 * Whether to use accelerate endpoint.
	 * @default false
	 */
	useAccelerateEndpoint?: boolean;
	bucket?: StorageBucket;
}

/**
 * Represents the content disposition of a file.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
 */
export interface ContentDisposition {
	type: 'attachment' | 'inline';
	filename?: string;
}

/** @deprecated This may be removed in the next major version. */
type ReadOptions =
	| {
			/** @deprecated This may be removed in the next major version. */
			accessLevel?: 'guest' | 'private';
	  }
	| {
			/** @deprecated This may be removed in the next major version. */
			accessLevel: 'protected';
			/** @deprecated This may be removed in the next major version. */
			targetIdentityId?: string;
	  };

/** @deprecated This may be removed in the next major version. */
interface WriteOptions {
	/** @deprecated This may be removed in the next major version. */
	accessLevel?: StorageAccessLevel;
}

interface BytesRangeOptions {
	bytesRange?: {
		start: number;
		end: number;
	};
}

/**
 * Transfer-related options type for S3 downloadData, uploadData APIs.
 */
interface TransferOptions {
	/**
	 * Callback function tracking the upload/download progress.
	 */
	onProgress?(event: TransferProgressEvent): void;
}

/**
 * Input options type for S3 getProperties API.
 */
/** @deprecated Use {@link GetPropertiesOptionsWithPath} instead. */
export type GetPropertiesOptionsWithKey = ReadOptions & CommonOptions;
export type GetPropertiesOptionsWithPath = CommonOptions;

/**
 * Input options type for S3 getProperties API.
 */
export type RemoveOptions = WriteOptions & CommonOptions;

/**
 * @deprecated Use {@link ListAllOptionsWithPath} instead.
 * Input options type with prefix for S3 list all API.
 */
export type ListAllOptionsWithPrefix = StorageListAllOptions &
	ReadOptions &
	CommonOptions;

/**
 * @deprecated Use {@link ListPaginateOptionsWithPath} instead.
 * Input options type with prefix for S3 list API to paginate items.
 */
export type ListPaginateOptionsWithPrefix = StorageListPaginateOptions &
	ReadOptions &
	CommonOptions;

/**
 * Input options type with path for S3 list all API.
 */
export type ListAllOptionsWithPath = Omit<
	StorageListAllOptions,
	'accessLevel'
> &
	CommonOptions & {
		subpathStrategy?: StorageSubpathStrategy;
	};

/**
 * Input options type with path for S3 list API to paginate items.
 */
export type ListPaginateOptionsWithPath = Omit<
	StorageListPaginateOptions,
	'accessLevel'
> &
	CommonOptions & {
		subpathStrategy?: StorageSubpathStrategy;
	};

/**
 * Input options type for S3 getUrl API.
 */
export type GetUrlOptions = CommonOptions & {
	/**
	 * Whether to head object to make sure the object existence before downloading.
	 * @default false
	 */
	validateObjectExistence?: boolean;
	/**
	 * Number of seconds till the URL expires.
	 * @default 900 (15 minutes)
	 */
	expiresIn?: number;
	/**
	 * The default content-disposition header value of the file when downloading it.
	 *   If a string is provided, it will be used as-is.
	 *   If an object is provided, it will be used to construct the header value
	 *   based on the ContentDisposition type definition.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
	 */
	contentDisposition?: ContentDisposition | string;
	/**
	 * The content-type header value of the file when downloading it.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
	 */
	contentType?: string;
};

/** @deprecated Use {@link GetUrlOptionsWithPath} instead. */
export type GetUrlOptionsWithKey = ReadOptions & GetUrlOptions;
export type GetUrlOptionsWithPath = GetUrlOptions;

/**
 * Input options type for S3 downloadData API.
 */
export type DownloadDataOptions = CommonOptions &
	TransferOptions &
	BytesRangeOptions;

/** @deprecated Use {@link DownloadDataOptionsWithPath} instead. */
export type DownloadDataOptionsWithKey = ReadOptions & DownloadDataOptions;
export type DownloadDataOptionsWithPath = DownloadDataOptions;

export type UploadDataOptions = CommonOptions &
	TransferOptions & {
		/**
		 * The default content-disposition header value of the file when downloading it.
		 *   If a string is provided, it will be used as-is.
		 *   If an object is provided, it will be used to construct the header value
		 *   based on the ContentDisposition type definition.
		 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
		 */
		contentDisposition?: ContentDisposition | string;
		/**
		 * The default content-encoding header value of the file when downloading it.
		 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
		 */
		contentEncoding?: string;
		/**
		 * The default content-type header value of the file when downloading it.
		 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
		 */
		contentType?: string;
		/**
		 * The user-defined metadata for the object uploaded to S3.
		 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#UserMetadata
		 */
		metadata?: Record<string, string>;
	};

/** @deprecated Use {@link UploadDataOptionsWithPath} instead. */
export type UploadDataOptionsWithKey = WriteOptions & UploadDataOptions;
export type UploadDataOptionsWithPath = UploadDataOptions;

/** @deprecated This may be removed in the next major version. */
export type CopySourceOptionsWithKey = ReadOptions & {
	/** @deprecated This may be removed in the next major version. */
	key: string;
	bucket?: StorageBucket;
};

/** @deprecated This may be removed in the next major version. */
export type CopyDestinationOptionsWithKey = WriteOptions & {
	/** @deprecated This may be removed in the next major version. */
	key: string;
	bucket?: StorageBucket;
};

export interface CopyWithPathSourceOptions {
	bucket?: StorageBucket;
}
export interface CopyWithPathDestinationOptions {
	bucket?: StorageBucket;
}

/**
 * Internal only type for S3 API handlers' config parameter.
 *
 * @internal
 */
export interface ResolvedS3Config
	extends Pick<SigningOptions, 'credentials' | 'region'> {
	customEndpoint?: string;
	forcePathStyle?: boolean;
	useAccelerateEndpoint?: boolean;
}
