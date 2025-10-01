import { FFmpeg, type FSNode } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import type p5 from 'p5';
import { getTimestamp } from '../utils';

import type { VideoFormatSettings } from '../types';
import type { GUIForP5 } from '../gui/GUIForP5';
import type { Dialog } from '../gui/Dialog';

let ffmpeg: FFmpeg;
let frameId = 0;

const MP4: VideoFormatSettings = {
	guiName: 'MP4 (HQ)',
	ext: 'mp4',
	mimeType: 'video/mp4',
	crf: 21,
	command:
		'-r FFMPEG_FPS -i frames/%06d.png -progress pipe:2 -c:v libx264 -pix_fmt yuv420p -crf FFMPEG_CRF -vf fps=FFMPEG_FPS,scale=FFMPEG_WIDTH:FFMPEG_HEIGHT:flags=lanczos -movflags faststart FFMPEG_OUTPUTFILE',
};

const WEBM_TRANSPARENT: VideoFormatSettings = {
	guiName: 'WEBM (transparent)',
	ext: 'webm',
	mimeType: 'video/webm',
	crf: 36,
	command:
		'-r FFMPEG_FPS -i frames/%06d.png -progress pipe:2 -c:v libvpx-vp9 -pix_fmt yuva420p -lossless 1 -vf fps=FFMPEG_FPS,scale=FFMPEG_WIDTH:FFMPEG_HEIGHT:flags=lanczos FFMPEG_OUTPUTFILE',
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
export async function ffmpegInit(gui: GUIForP5) {
	dialog = gui.dialog;

	ffmpeg = new FFmpeg();
	const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm';

	ffmpeg.on('log', ({ message }) => {
		console.log(message);
	});

	ffmpeg.on('progress', ({ progress, time }) => {
		console.log(progress, time);
	});

	await ffmpeg.load({
		coreURL: await toBlobURL(
			`${baseURL}/ffmpeg-core.js`,
			'text/javascript'
		),
		wasmURL: await toBlobURL(
			`${baseURL}/ffmpeg-core.wasm`,
			'application/wasm'
		),
		workerURL: await toBlobURL(
			`${baseURL}/ffmpeg-core.worker.js`,
			'text/javascript'
		),
	});
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
	ffmpegSaveFrame(frameId, pngData);
	frameId++;
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

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export async function ffmpegCreateVideo(
	width: number,
	height: number,
	fps: number
) {
	console.log('exporting');

	let fileName = `${width}x${height}@${fps}fps_${getTimestamp().base64}`;
	const outputFile = fileName + '.' + videoExportSettings.ext;

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
	cmd = cmd.replaceAll('FFMPEG_CRF', '' + (videoExportSettings.crf || 21));
	cmd = cmd.replaceAll('FFMPEG_OUTPUTFILE', outputFile);
	cmd = cmd.replaceAll('FFMPEG_WIDTH', '' + width);
	cmd = cmd.replaceAll('FFMPEG_HEIGHT', '' + height);

	let args = cmd.split(' ');
	console.log('FFmpeg command:', args.join(' '));

	let execResult = await ffmpeg.exec(args);
	console.log('FFmpeg finished:', execResult);

	const data = await ffmpeg.readFile(outputFile);
	const blob = new Blob([data as BlobPart], {
		type: videoExportSettings.mimeType,
	});
	downloadBlob(blob, outputFile);
	frameId = 0;

	dialog.alert(
		'<h1>Video ready</h1>' +
			`<p>The video file has been downloaded as a ${videoExportSettings.ext.toUpperCase()} file.</p>`
	);

	// need to clean frames to prevent newer shorter animatinos to include old frames
	await ffmpeg.deleteDir('/frames');
	isFramesDirectoryCreated = false;
}
