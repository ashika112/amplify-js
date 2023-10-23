// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { requestPermissions } from '../../../../../src/pushNotifications/providers/pinpoint/apis/requestPermissions';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';

describe('requestPermissions', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(requestPermissions());
	});
});
