/**
 * @fileoverview FFmpeg utilities for capturing frames and exporting videos.
 *
 * This module provides functions to initialize FFmpeg, capture frames, and export videos in MP4 or WebM formats.
 *
 * It uses the ffmpeg.wasm library to handle video processing in the browser.
 *
 * Modified from {@link https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/vanilla-app/public/concatDemuxer.html|example}.
 *
 * @see startCapture
 * @see stopCapture
 * @see ffmpegSetup
 * @see ffmpegSaveFrame
 * @see ffmpegCreateMP4
 */

const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;

let ffmpegFR = 30;

let ffmpeg = null;
let isFfmpegInit = false;

let loadingAnim;
let videoDownloadLink;

let conversionProgress = 0;
let dConversionProgress = 1;

let savedFrameCount = 0;

let guiCaptureButtonMP4;
let guiCaptureButtonWEBM;
let guiCaptureButtonChoice;

let guiVideoLoadingDiv;

/**
 * Preset export settings for MP4 output.
 * @type {{ext: string, mimeType: string, crf: number}}
 */
const MP4 = {
	ext: 'mp4',
	mimeType: 'video/mp4',
	crf: 21, // inverse quality (constant rate factor)
};

/**
 * Preset export settings for MP4 output.
 * @type {{ext: string, mimeType: string, crf: number}}
 */
const WEBM_TRANSPARENT = {
	ext: 'webm',
	// mimeType: 'video/webm;codecs=vp9',
	mimeType: 'video/webm',
	crf: 21, // inverse quality (constant rate factor)
};

let ffmpegExportSettings; // = MP4;

/**
 * Start capturing frames for video export.
 * Resets the frame counter and enables capturing state.
 */
function startCapture() {
	savedFrameCount = 0;
	isCapturingFrames = true;
	isPlaying = true;
	conversionProgress = 0;
}

/**
 * Stop capturing frames and pause playback.
 */
function stopCapture() {
	isCapturingFrames = false;
	isPlaying = false;
}

/**
 * Remove all frame images from the in-memory file system.
 * @returns {Promise<void>} Resolves when the directory is cleared.
 */
async function clearFramesDir() {
	const listdir = await ffmpeg.listDir('/frames');
	for (let item of listdir) {
		if (item.isDir) continue;
		await ffmpeg.deleteFile('/frames/' + item.name);
	}
	await ffmpeg.deleteDir('/frames');
}

const BASE64_MARKER = ';base64,';
/**
 * Convert a data URI to a binary array.
 * @param {string} dataURI Data URI containing base64 encoded data.
 * @returns {Uint8Array} Binary representation of the data.
 */
function convertDataURIToBinary(dataURI) {
	const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	const base64 = dataURI.substring(base64Index);
	const raw = window.atob(base64);
	const rawLength = raw.length;
	let array = new Uint8Array(new ArrayBuffer(rawLength));
	for (i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}
/**
 * Capture the current canvas frame and store it as a PNG file.
 * @param {number} frameId Sequential frame number used for the filename.
 */
function saveToLocalFFMPEG(frameId) {
	let dataURI = canvas.elt.toDataURL('image/png');
	let pngData = convertDataURIToBinary(dataURI);
	ffmpegSaveFrame(frameId, pngData);
}

/**
 * Cache GUI elements used during video export.
 */
function ffmpegUtilInit() {
	guiCaptureButtonMP4 = gui.getController('buttonVidCaptureMP4');
	guiCaptureButtonWEBM = gui.getController('buttonVidCaptureWEBM');
}

/**
 * Initialise the ffmpeg.wasm instance and load the core assets.
 * Also sets up log and progress listeners.
 * @returns {Promise<void>} Resolves when ffmpeg is ready.
 */
async function ffmpegInit() {
	ffmpeg = new FFmpeg();

	ffmpeg.on('log', ({ logMsg }) => {
		updateConversionProgress();
	});

	ffmpeg.on('progress', ({ progress, time }) => {
		updateConversionProgress(progress);
	});

	let dirPath = window.location.pathname;
	if (dirPath.indexOf('/') > -1)
		dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
	await ffmpeg.load({
		coreURL: dirPath + '/ffmpeg/core/ffmpeg-core.js',
	});

	isFfmpegInit = true;
}

/**
 * Initialise ffmpeg utilities and start loading ffmpeg asynchronously.
 */
function ffmpegSetup() {
	ffmpegUtilInit(); // sync
	ffmpegInit(); // async
}

/**
 * Update the GUI with current encoding progress.
 * @param {number} [progress] Normalised progress from ffmpeg (0-1).
 */
function updateConversionProgress(progress = undefined) {
	if (progress === undefined) return;

	let progText;
	switch (ffmpegExportSettings.ext) {
		case 'mp4':
			conversionProgress += dConversionProgress;
			progText = 'Progress: ' + conversionProgress;
			break;
		case 'webm':
			progText = 'Progress: ' + round(progress * 1000) / 10 + '%';
			break;
	}
	guiCaptureButtonChoice.controllerElement.html(progText);
}

/**
 * Write a PNG frame to the ffmpeg in-memory filesystem.
 * @param {number} frameId Frame number used for naming.
 * @param {Uint8Array} pngData Raw PNG data.
 */
function ffmpegSaveFrame(frameId, pngData) {
	ffmpeg.createDir('frames');
	let fileName = nf(frameId, 6) + '.png';
	let filePath = 'frames/' + fileName;
	ffmpeg.writeFile(filePath, pngData);
}

/**
 * List all frame files written to the ffmpeg filesystem.
 * @returns {Promise<string[]>} Array of file names.
 */
async function getFrameFileNames() {
	let frames = await ffmpeg.listDir('frames');
	frames = frames.filter(item => !item.isDir).map(frame => frame.name);
	return frames;
}

/**
 * Compile captured frames into a video and prompt the user to download it.
 * Handles both MP4 and WebM export based on current settings.
 * @returns {Promise<void>} Resolves when the video has been created and loaded.
 */
async function ffmpegCreateMP4() {
	guiCaptureButtonChoice.disable();
	guiVideoLoadingDiv.div.show();

	// create concatenation file list as .txt
	let frames = await getFrameFileNames();
	let inputPaths = frames.map(f => `file frames/${f}`);
	const concatFile = 'concat_list.txt';
	await ffmpeg.writeFile(concatFile, inputPaths.join('\n'));

	// run ffmpeg concatenation
	const outputFile = 'output.' + ffmpegExportSettings.ext;
	const width = canvas.width,
		height = canvas.height;

	let args;
	switch (ffmpegExportSettings.ext) {
		case 'mp4':
			args =
				`-r ${ffmpegFR} -f image2 -safe 0 -f concat -i ${concatFile} -progress pipe:2 -vcodec libx264 -pix_fmt yuv420p -crf ${ffmpegExportSettings.crf} -vf fps=${ffmpegFR}.0,scale=${width}:${height}:flags=lanczos -movflags faststart ${outputFile}`.split(
					' '
				);
			break;
		case 'webm':
			args =
				`-i frames/%06d.png -progress pipe:2 -r ${ffmpegFR} -crf ${ffmpegExportSettings.crf} -c:v libvpx -pix_fmt yuva420p -auto-alt-ref 0 ${outputFile}`.split(
					' '
				);
			break;
	}

	print('ffmpeg.wasm arguments:', args.join(' '));

	let execResult = await ffmpeg.exec(args);

	// load mp4 to HTML video element
	const data = await ffmpeg.readFile(outputFile);
	const video = document.getElementById('output-video');
	const blob = new Blob([data.buffer], {
		type: ffmpegExportSettings.mimeType,
	});
	const blobURL = URL.createObjectURL(blob);
	video.src = blobURL;

	videoDownloadLink = document.getElementById('video-link');
	videoDownloadLink.innerHTML = 'Download video';
	videoDownloadLink.title = 'download';
	videoDownloadLink.download = Generator.getOutputFileName();
	videoDownloadLink.href = blobURL;
	videoDownloadLink.click(); // auto-download

	guiVideoLoadingDiv.div.hide();
	guiCaptureButtonChoice.controllerElement.html(
		lang.process(
			'Start LANG_VID_CAPTURE ' + ffmpegExportSettings.ext.toUpperCase(),
			true
		)
	);
	guiCaptureButtonChoice.enable();

	setTimeout(
		() => dialog.alert(lang.process('LANG_VIDEO_READY_MSG', true)),
		50
	);

	clearFramesDir();

	console.log('Created and loaded video.');

	isPlaying = true;
}
