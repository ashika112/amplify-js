// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInputWithKey,
	StorageCopyInputWithPath,
	StorageDownloadDataInputWithKey,
	StorageDownloadDataInputWithPath,
	StorageGetPropertiesInputWithKey,
	StorageGetPropertiesInputWithPath,
	StorageGetUrlInputWithKey,
	StorageGetUrlInputWithPath,
	StorageListInputWithPath,
	StorageListInputWithPrefix,
	StorageRemoveInputWithKey,
	StorageRemoveInputWithPath,
	StorageUploadDataInputWithKey,
	StorageUploadDataInputWithPath,
} from '../../../types';
import {
	CopyDestinationOptionsWithKey,
	CopySourceOptionsWithKey,
	DownloadDataOptionsWithKey,
	DownloadDataOptionsWithPath,
	GetPropertiesOptionsWithKey,
	GetPropertiesOptionsWithPath,
	GetUrlOptionsWithKey,
	GetUrlOptionsWithPath,
	ListAllOptionsWithPath,
	ListAllOptionsWithPrefix,
	ListPaginateOptionsWithPath,
	ListPaginateOptionsWithPrefix,
	RemoveOptions,
	UploadDataOptionsWithKey,
	UploadDataOptionsWithPath,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = CopyInputWithKey | CopyInputWithPath;

/** @deprecated Use {@link CopyInputWithPath} instead. */
export type CopyInputWithKey = StorageCopyInputWithKey<
	CopySourceOptionsWithKey,
	CopyDestinationOptionsWithKey
>;
export type CopyInputWithPath = StorageCopyInputWithPath;

/**
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput = StrictUnion<
	GetPropertiesInputWithKey | GetPropertiesInputWithPath
>;

/** @deprecated Use {@link GetPropertiesInputWithPath} instead. */
export type GetPropertiesInputWithKey =
	StorageGetPropertiesInputWithKey<GetPropertiesOptionsWithKey>;
export type GetPropertiesInputWithPath =
	StorageGetPropertiesInputWithPath<GetPropertiesOptionsWithPath>;

/**
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StrictUnion<GetUrlInputWithKey | GetUrlInputWithPath>;

/** @deprecated Use {@link GetUrlInputWithPath} instead. */
export type GetUrlInputWithKey =
	StorageGetUrlInputWithKey<GetUrlOptionsWithKey>;
export type GetUrlInputWithPath =
	StorageGetUrlInputWithPath<GetUrlOptionsWithPath>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StrictUnion<
	ListAllInputWithPath | ListAllInputWithPrefix
>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput = StrictUnion<
	ListPaginateInputWithPath | ListPaginateInputWithPrefix
>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputWithPath =
	StorageListInputWithPath<ListAllOptionsWithPath>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputWithPath =
	StorageListInputWithPath<ListPaginateOptionsWithPath>;

/**
 * @deprecated Use {@link ListAllInputWithPath} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputWithPrefix =
	StorageListInputWithPrefix<ListAllOptionsWithPrefix>;

/**
 * @deprecated Use {@link ListPaginateInputWithPath} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputWithPrefix =
	StorageListInputWithPrefix<ListPaginateOptionsWithPrefix>;

/**
 * @deprecated Use {@link RemoveInputWithPath} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInputWithKey = StorageRemoveInputWithKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveInputWithPath = StorageRemoveInputWithPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StrictUnion<RemoveInputWithKey | RemoveInputWithPath>;

/**
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput = StrictUnion<
	DownloadDataInputWithKey | DownloadDataInputWithPath
>;
/** @deprecated Use {@link DownloadDataInputWithPath} instead. */
export type DownloadDataInputWithKey =
	StorageDownloadDataInputWithKey<DownloadDataOptionsWithKey>;
export type DownloadDataInputWithPath =
	StorageDownloadDataInputWithPath<DownloadDataOptionsWithPath>;

/**
 * Input type for S3 uploadData API.
 */
/** @deprecated Use {@link UploadDataInputWithPath} instead. */
export type UploadDataInput =
	StorageUploadDataInputWithKey<UploadDataOptionsWithKey>;
export type UploadDataInputWithPath =
	StorageUploadDataInputWithPath<UploadDataOptionsWithPath>;
