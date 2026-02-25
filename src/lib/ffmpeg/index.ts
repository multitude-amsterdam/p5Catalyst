import type p5 from 'p5';
import type { VideoFormatSettings } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { Dialog } from '../gui/Dialog';

import { FFmpeg, type FSNode } from '@ffmpeg/ffmpeg';
import JSZip from 'jszip';
import { getTimestamp } from '../utils';

let ffmpeg: FFmpeg | undefined;
let frameId = 0;
let frameWriteQueue: Promise<void> = Promise.resolve();
let frameWriteError: unknown = null;
const FRAMES_DIR = '/frames';
let ffmpegProgress = 0;
let currentExportAbortController: AbortController | null = null;
let isExportCancellationRequested = false;

function clampProgress(value: number) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}

function setFFmpegProgress(value: number) {
	ffmpegProgress = clampProgress(value);
}

const onFFmpegLog = ({ message }: { message: string }) => {
	console.log(message);
};

const onFFmpegProgress = ({
	progress,
	time,
}: {
	progress: number;
	time: number;
}) => {
	setFFmpegProgress(progress);
	console.log(progress, time);
};

function createFFmpegInstance() {
	const instance = new FFmpeg();
	instance.on('log', onFFmpegLog);
	instance.on('progress', onFFmpegProgress);
	return instance;
}

async function ensureFFmpegLoaded() {
	if (!ffmpeg) {
		ffmpeg = createFFmpegInstance();
	}
	if (!ffmpeg.loaded) {
		await ffmpeg.load();
		console.log('ffmpeg.wasm initialized.');
	}
	return ffmpeg;
}

export function getFFmpegProgress() {
	return ffmpegProgress;
}

export function resetFFmpegProgress() {
	ffmpegProgress = 0;
}

function isAbortError(error: unknown) {
	if (!error || typeof error !== 'object') return false;
	const name = (error as { name?: string }).name;
	return name === 'AbortError';
}

export function cancelFFmpegExport() {
	isExportCancellationRequested = true;
	currentExportAbortController?.abort();

	const instance = ffmpeg;
	if (instance?.loaded) {
		try {
			instance.terminate();
		} catch (error) {
			console.warn('Failed to terminate ffmpeg worker.', error);
		}
	}

	ffmpeg = undefined;
	isFramesDirectoryCreated = false;
	resetFFmpegProgress();
}

const MP4: VideoFormatSettings = {
	guiName: 'MP4 (HQ)',
	ext: 'mp4',
	mimeType: 'video/mp4',
	crf: 21,
	command:
		'-y -nostdin -framerate FFMPEG_FPS -i /frames/%06d.png -c:v libx264 -threads 1 -pix_fmt yuv420p -crf FFMPEG_CRF -vf scale=FFMPEG_WIDTH:FFMPEG_HEIGHT:flags=lanczos -movflags +faststart FFMPEG_OUTPUTFILE',
};

const WEBM_TRANSPARENT: VideoFormatSettings = {
	guiName: 'WEBM (transparent)',
	ext: 'webm',
	mimeType: 'video/webm',
	crf: 36,
	command:
		'-y -nostdin -framerate FFMPEG_FPS -i /frames/%06d.png -c:v libvpx-vp9 -threads 1 -pix_fmt yuva420p -lossless 1 -vf scale=FFMPEG_WIDTH:FFMPEG_HEIGHT:flags=lanczos FFMPEG_OUTPUTFILE',
};

const FRAME_SEQUENCE: VideoFormatSettings = {
	guiName: 'Frame sequence (PNG)',
	ext: 'zip',
	mimeType: 'application/zip',
	command: '',
};

export const videoFormats = {
	MP4,
	WEBM_TRANSPARENT,
	FRAME_SEQUENCE,
};

let videoExportSettings = MP4;

export function setVideoFormatSettings(guiName: string) {
	const format = Object.values(videoFormats).find(f => f.guiName === guiName);

	if (format) {
		videoExportSettings = format;
	} else {
		console.log(guiName + ' is not a supported video format');
	}
}

let dialog: Dialog;
export async function ffmpegInit(gui: CatalystGUI) {
	dialog = gui.dialog;
	await ensureFFmpegLoaded();
}

export function logFFMPEG() {
	if (!ffmpeg) return;
	console.trace(ffmpeg);
}

function convertDataURLToBinary(dataURL: string) {
	const base64Index = dataURL.indexOf(';base64,') + ';base64,'.length;
	const base64 = dataURL.substring(base64Index);
	const raw = window.atob(base64);
	const rawLength = raw.length;
	let array = new Uint8Array(new ArrayBuffer(rawLength));
	for (let i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}

export function saveToLocalFFMPEG(canvas: p5.Renderer) {
	let dataURL = canvas.elt.toDataURL('image/png');
	let pngData = convertDataURLToBinary(dataURL);
	const currentFrameId = frameId;
	frameId++;

	frameWriteQueue = frameWriteQueue
		.then(() => ffmpegSaveFrame(currentFrameId, pngData))
		.catch(error => {
			frameWriteError = error;
			console.error(`Failed to save frame ${currentFrameId}.`, error);
		});
}

let isFramesDirectoryCreated = false;

async function doesFramesDirectoryExist() {
	const instance = ffmpeg;
	if (!instance?.loaded) {
		return false;
	}

	try {
		await instance.listDir(FRAMES_DIR);
		return true;
	} catch {
		return false;
	}
}

async function ensureFramesDirectory() {
	const instance = await ensureFFmpegLoaded();

	if (isFramesDirectoryCreated) return;

	try {
		await instance.createDir(FRAMES_DIR);
	} catch (error) {
		// If the directory already exists, continue without failing the recording.
		const exists = await doesFramesDirectoryExist();
		if (!exists) {
			throw error;
		}
	}

	isFramesDirectoryCreated = true;
}

async function clearFramesDirectory() {
	const instance = ffmpeg;
	if (!instance?.loaded) {
		isFramesDirectoryCreated = false;
		return;
	}

	const exists = await doesFramesDirectoryExist();
	if (!exists) {
		isFramesDirectoryCreated = false;
		return;
	}

	isFramesDirectoryCreated = true;
	const files: FSNode[] = await instance.listDir(FRAMES_DIR);

	for (const item of files) {
		if (item.name === '.' || item.name === '..') continue;
		const filePath = `${FRAMES_DIR}/${item.name}`;
		try {
			if (item.isDir) {
				await instance.deleteDir(filePath);
			} else {
				await instance.deleteFile(filePath);
			}
		} catch (cleanupError) {
			console.warn(`Failed to remove ${filePath}.`, cleanupError);
		}
	}
}

async function ffmpegSaveFrame(frameId: number, pngData: Uint8Array) {
	const instance = await ensureFFmpegLoaded();
	await ensureFramesDirectory();

	// Defensive: if cleanup failed on the previous run, wipe stale frames
	// before writing a new sequence.
	if (frameId === 0) {
		await clearFramesDirectory();
	}

	let fileName = frameId.toString().padStart(6, '0') + '.png';
	let filePath = `${FRAMES_DIR}/${fileName}`;
	await instance.writeFile(filePath, pngData);
}

async function flushPendingFrameWrites() {
	await frameWriteQueue;

	if (frameWriteError) {
		const error = frameWriteError;
		frameWriteError = null;
		throw error;
	}
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	window.setTimeout(() => {
		link.remove();
		URL.revokeObjectURL(url);
	}, 1000);
}

export async function ffmpegCreateVideo(
	width: number,
	height: number,
	fps: number,
	finalCallback?: () => void
) {
	console.log('Exporting video...');
	resetFFmpegProgress();
	isExportCancellationRequested = false;
	currentExportAbortController = new AbortController();
	const abortSignal = currentExportAbortController.signal;

	let fileName = `${width}x${height}@${fps}fps_${getTimestamp().base64}`;
	const outputFile = fileName + '.' + videoExportSettings.ext;
	const outputPath = '/' + outputFile;

	try {
		const instance = await ensureFFmpegLoaded();
		await flushPendingFrameWrites();
		if (isExportCancellationRequested || abortSignal.aborted) return;

		if (videoExportSettings === FRAME_SEQUENCE) {
			const frames: FSNode[] = await instance.listDir(FRAMES_DIR);
			const zip = new JSZip();

			for (const item of frames) {
				if (isExportCancellationRequested || abortSignal.aborted)
					return;
				if (!item.isDir && item.name.endsWith('.png')) {
					const filePath = `${FRAMES_DIR}/${item.name}`;
					const data = await instance.readFile(filePath);
					zip.file(item.name, data as Uint8Array);
				}
			}
			if (isExportCancellationRequested || abortSignal.aborted) return;

			const content = await zip.generateAsync({ type: 'blob' });
			if (isExportCancellationRequested || abortSignal.aborted) return;
			setFFmpegProgress(1);
			downloadBlob(content, outputFile); // triggers browser download
			dialog.alert(
				'<h1>Frame sequence ready</h1>' +
					'<p>The frames have been downloaded as a ZIP file.</p>'
			);
			return;
		}

		// Replace placeholders in command string with actual values
		let cmd = videoExportSettings.command;
		cmd = cmd.replaceAll('FFMPEG_FPS', '' + fps);
		cmd = cmd.replaceAll(
			'FFMPEG_CRF',
			'' + (videoExportSettings.crf || 21)
		);
		cmd = cmd.replaceAll('FFMPEG_OUTPUTFILE', outputPath);
		cmd = cmd.replaceAll('FFMPEG_WIDTH', '' + width);
		cmd = cmd.replaceAll('FFMPEG_HEIGHT', '' + height);

		let args = cmd.split(' ');
		console.log('FFmpeg command:', args.join(' '));

		let execResult = await instance.exec(args, undefined, {
			signal: abortSignal,
		});
		console.log('FFmpeg finished:', execResult);
		if (execResult !== 0) {
			throw new Error(`FFmpeg exited with code ${execResult}.`);
		}
		if (isExportCancellationRequested || abortSignal.aborted) return;

		const data = await instance.readFile(outputPath);
		const blob = new Blob([data as BlobPart], {
			type: videoExportSettings.mimeType,
		});
		if (isExportCancellationRequested || abortSignal.aborted) return;
		setFFmpegProgress(1);
		downloadBlob(blob, outputFile);

		dialog.alert(
			'<h1>Video ready</h1>' +
				`<p>The video file has been downloaded as a ${videoExportSettings.ext.toUpperCase()} file.</p>`
		);
	} catch (error) {
		if (
			isExportCancellationRequested ||
			abortSignal.aborted ||
			isAbortError(error)
		) {
			console.log('Video export cancelled.');
			return;
		}

		console.error('Video export failed.', error);
		dialog.alert(
			'<h1>Video export failed</h1>' +
				'<p>Check the browser console for details.</p>'
		);
		throw error;
	} finally {
		frameId = 0;
		frameWriteError = null;
		frameWriteQueue = Promise.resolve();
		currentExportAbortController = null;
		isExportCancellationRequested = false;

		// need to clean frames to prevent newer shorter animations to include old frames
		try {
			await clearFramesDirectory();
		} catch (cleanupError) {
			console.warn('Failed to clear /frames after export.', cleanupError);
		}

		finalCallback?.();
	}
}
