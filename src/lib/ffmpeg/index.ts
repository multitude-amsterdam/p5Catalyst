import type p5 from 'p5';
import type { VideoFormatSettings } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { Dialog } from '../gui/Dialog';

import { FFmpeg, type FSNode } from '@ffmpeg/ffmpeg';
import JSZip from 'jszip';
import { getTimestamp } from '../utils';

let ffmpeg: FFmpeg;
let frameId = 0;
let frameWriteQueue: Promise<void> = Promise.resolve();
let frameWriteError: unknown = null;

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

	ffmpeg = new FFmpeg();

	ffmpeg.on('log', ({ message }) => {
		console.log(message);
	});

	ffmpeg.on('progress', ({ progress, time }) => {
		console.log(progress, time);
	});

	await ffmpeg.load();
	console.log('ffmpeg.wasm initialized.');
}

export function logFFMPEG() {
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

async function ffmpegSaveFrame(frameId: number, pngData: Uint8Array) {
	if (!isFramesDirectoryCreated) {
		await ffmpeg.createDir('/frames');
		isFramesDirectoryCreated = true;
	}

	let fileName = frameId.toString().padStart(6, '0') + '.png';
	let filePath = '/frames/' + fileName;
	await ffmpeg.writeFile(filePath, pngData);
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

	let fileName = `${width}x${height}@${fps}fps_${getTimestamp().base64}`;
	const outputFile = fileName + '.' + videoExportSettings.ext;
	const outputPath = '/' + outputFile;

	try {
		await flushPendingFrameWrites();

		if (videoExportSettings === FRAME_SEQUENCE) {
			const frames: FSNode[] = await ffmpeg.listDir('/frames');
			const zip = new JSZip();

			for (const item of frames) {
				if (!item.isDir && item.name.endsWith('.png')) {
					const filePath = `/frames/${item.name}`;
					const data = await ffmpeg.readFile(filePath);
					zip.file(item.name, data as Uint8Array);
				}
			}

			const content = await zip.generateAsync({ type: 'blob' });
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

		let execResult = await ffmpeg.exec(args);
		console.log('FFmpeg finished:', execResult);
		if (execResult !== 0) {
			throw new Error(`FFmpeg exited with code ${execResult}.`);
		}

		const data = await ffmpeg.readFile(outputPath);
		const blob = new Blob([data as BlobPart], {
			type: videoExportSettings.mimeType,
		});
		downloadBlob(blob, outputFile);

		dialog.alert(
			'<h1>Video ready</h1>' +
				`<p>The video file has been downloaded as a ${videoExportSettings.ext.toUpperCase()} file.</p>`
		);
	} catch (error) {
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

		// need to clean frames to prevent newer shorter animations to include old frames
		if (isFramesDirectoryCreated) {
			try {
				await ffmpeg.deleteDir('/frames');
			} catch (cleanupError) {
				console.warn(
					'Failed to delete /frames after export.',
					cleanupError
				);
			}
			isFramesDirectoryCreated = false;
		}

		finalCallback?.();
	}
}
