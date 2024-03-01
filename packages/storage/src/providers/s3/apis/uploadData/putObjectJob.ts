// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { calculateContentMd5, resolveS3ConfigAndInput } from '../../utils';
import { Item as S3Item, ItemPath as S3ItemPath } from '../../types/outputs';
import { putObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { UploadDataInput } from '../../types/inputs';
import { validateStorageOperationInput } from '../../utils/utils';
import { STORAGE_INPUT_TYPES } from '../../utils/constants';

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	(
		uploadInput: UploadDataInput,
		abortSignal: AbortSignal,
		totalLength?: number,
	) =>
	async (): Promise<S3Item | S3ItemPath> => {
		const { options: uploadDataOptions, data } = uploadInput;

		const {
			bucket,
			keyPrefix,
			s3Config,
			isObjectLockEnabled,
			identityId,
			userSub,
		} = await resolveS3ConfigAndInput(Amplify, uploadDataOptions);

		const { inputType, objectKey } = validateStorageOperationInput(
			uploadInput,
			identityId,
			userSub,
		);

		const finalKey =
			inputType === STORAGE_INPUT_TYPES.KEY ? keyPrefix + objectKey : objectKey;

		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			metadata,
			onProgress,
		} = uploadDataOptions ?? {};

		const { ETag: eTag, VersionId: versionId } = await putObject(
			{
				...s3Config,
				abortSignal,
				onUploadProgress: onProgress,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				Body: data,
				ContentType: contentType,
				ContentDisposition: contentDisposition,
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ContentMD5: isObjectLockEnabled
					? await calculateContentMd5(data)
					: undefined,
			},
		);

		const result = {
			eTag,
			versionId,
			contentType,
			metadata,
			size: totalLength,
		};

		return inputType === STORAGE_INPUT_TYPES.KEY
			? { key: objectKey, ...result }
			: { path: finalKey, ...result };
	};
