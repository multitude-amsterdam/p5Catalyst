import { FFmpeg, type FSNode } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type p5 from 'p5';

import type { VideoFormatSettings } from '../types';

let ffmpeg: FFmpeg;
let frameId = 0;

const MP4: VideoFormatSettings = {
	ext: 'mp4',
	mimeType: 'video/mp4',
	crf: 21,
	command:
		'-r FFMPEG_FPS -f image2 -safe 0 -f concat -i FFMPEG_CONCATFILE -progress pipe:2 -vcodec libx264 -pix_fmt yuv420p -crf FFMPEG_CRF -vf fps=FFMPEG_FPS,scale=FFMPEG_WIDTH:FFMPEG_HEIGHT:flags=lanczos -movflags faststart FFMPEG_OUTPUTFILE',
};

const WEBM_TRANSPARENT: VideoFormatSettings = {
	ext: 'webm',
	// mimeType: 'video/webm;codecs=vp9',
	mimeType: 'video/webm',
	crf: 21,
	command: 'TODO: see legacy file',
};

let videoExportSettings = MP4;

export async function ffmpegInit() {
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

let framesDirectoryCreated = false;

async function ffmpegSaveFrame(frameId: number, pngData: Uint8Array) {
	if (!framesDirectoryCreated) {
		await ffmpeg.createDir('/frames');
		framesDirectoryCreated = true;
	}

	let fileName = frameId.toString().padStart(6, '0') + '.png';
	let filePath = 'frames/' + fileName;
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

async function getFrameFileNames() {
	const frames: FSNode[] = await ffmpeg.listDir('/frames');
	const frameNames: string[] = frames
		.filter(item => !item.isDir)
		.map(frame => frame.name);
	return frameNames;
}

export async function ffmpegCreateMP4(
	width: number,
	height: number,
	fps: number
) {
	console.log('exporting');
	// create concatenation file list as .txt
	let frames = await getFrameFileNames();
	let inputPaths = frames.map(f => `file frames/${f}`);
	const concatFile = 'concat_list.txt';
	await ffmpeg.writeFile(concatFile, inputPaths.join('\n'));

	// run ffmpeg concatenation
	const outputFile = 'output.' + videoExportSettings.ext;

	let cmd = videoExportSettings.command;
	cmd = cmd.replaceAll('FFMPEG_FPS', '' + fps);
	cmd = cmd.replaceAll('FFMPEG_CONCATFILE', concatFile);
	cmd = cmd.replaceAll('FFMPEG_CRF', '' + (videoExportSettings.crf || 21));
	cmd = cmd.replaceAll('FFMPEG_OUTPUTFILE', outputFile);
	cmd = cmd.replaceAll('FFMPEG_WIDTH', '' + width);
	cmd = cmd.replaceAll('FFMPEG_HEIGHT', '' + height);
	let args = cmd.split(' ');

	console.log(cmd);

	let execResult = await ffmpeg.exec(args);
	console.log(execResult);

	// load mp4 to HTML video element
	const data = await ffmpeg.readFile(outputFile);
	const blob = new Blob([data as Uint8Array], {
		type: videoExportSettings.mimeType,
	});
	downloadBlob(blob, outputFile);
	frameId = 0;

	// await ffmpeg.deleteDir('/frames');
	// framesDirectoryCreated = false;
}
