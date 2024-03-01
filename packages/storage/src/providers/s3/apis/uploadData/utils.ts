import { UploadDataInput } from '../../types';
import { UploadDataInputKey, UploadDataInputPath } from '../../types/inputs';

const isInputWithKey = (
	input: UploadDataInput,
): input is UploadDataInputKey => {
	return input.key !== undefined;
};

const isInputWithPath = (
	input: UploadDataInput,
): input is UploadDataInputPath => {
	return input.path !== undefined;
};

export const validateUploadInput = (
	uploadInput: UploadDataInput,
	keyPrefix: string,
) => {
	let finalKey;
	if (isInputWithPath(uploadInput)) {
		const { path } = uploadInput;
		finalKey = typeof path === 'string' ? path : path({});

		return { inputType: 'path', finalKey };
	} else if (isInputWithKey(uploadInput)) {
		finalKey = keyPrefix + uploadInput.key;

		return { inputType: 'key', finalKey };
	} else {
		throw new Error('invalid input');
	}
};
