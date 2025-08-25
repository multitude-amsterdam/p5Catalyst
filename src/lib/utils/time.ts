import { toB64 } from 'utils/data';

/**
 * Generate a base 64 and unix timestamp.
 * @returns {string}
 */
export function getTimestamp(): {
	unix: string;
	base64: string;
} {
	const now = new Date();
	return {
		unix: Math.floor(now.getTime() / 1000).toString(),
		base64: toB64(now.getTime()),
	};
}
