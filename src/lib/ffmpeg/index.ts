import { FFmpeg, type FSNode } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type p5 from 'p5';

let ffmpeg: FFmpeg;
let frameId = 0;

const MP4 = {
	ext: 'mp4',
	mimeType: 'video/mp4',
	crf: 21, // inverse quality (constant rate factor)
};

const WEBM_TRANSPARENT = {
	ext: 'webm',
	// mimeType: 'video/webm;codecs=vp9',
	mimeType: 'video/webm',
	crf: 21, // inverse quality (constant rate factor)
};

let ffmpegExportSettings = WEBM_TRANSPARENT;

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
		await ffmpeg.createDir('frames');
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
	const frames: FSNode[] = await ffmpeg.listDir('frames');
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
	const outputFile = 'output.' + 'mp4';

	let args =
		`-r ${fps} -f image2 -safe 0 -f concat -i ${concatFile} -progress pipe:2 -vcodec libx264 -pix_fmt yuv420p -crf ${ffmpegExportSettings.crf} -vf fps=${fps}.0,scale=${width}:${height}:flags=lanczos -movflags faststart ${outputFile}`.split(
			' '
		);

	let execResult = await ffmpeg.exec(args);
	console.log(execResult);

	// load mp4 to HTML video element
	const data = await ffmpeg.readFile(outputFile);
	const blob = new Blob([data as Uint8Array], {
		type: ffmpegExportSettings.mimeType,
	});
	downloadBlob(blob, 'output.mp4');
	frameId = 0;
}
