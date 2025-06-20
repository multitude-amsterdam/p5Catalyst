
const doLoadLocal = true;

// example from:
// https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/vanilla-app/public/concatDemuxer.html

const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;

const ffmpegFR = 30;

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

let ffmpegExportSettings;// = MP4;



function startCapture() {
	// console.log('startCapture()...');
	savedFrameCount = 0;
	isCapturingFrames = true;
	isPlaying = true;
	conversionProgress = 0;
	// frameCount = 0; // resets 'time'
}



function stopCapture() {
	// console.log('stopCapture()...');
	isCapturingFrames = false;
	isPlaying = false;
}



async function clearFramesDir() {
	// console.log('clearFramesDir()...');
	const listdir = await ffmpeg.listDir('/frames');
	for (let item of listdir) {
		if (item.isDir) continue;
		await ffmpeg.deleteFile('/frames/' + item.name);
	}
	await ffmpeg.deleteDir('/frames');
}



const BASE64_MARKER = ';base64,';
function convertDataURIToBinary(dataURI) {
	const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	const base64 = dataURI.substring(base64Index);
	const raw = window.atob(base64);
	const rawLength = raw.length;
	let array = new Uint8Array(new ArrayBuffer(rawLength));
	for(i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}
function saveToLocalFFMPEG(frameId) {
	// console.log('Saving local frame...', frameId);
	let dataURI = canvas.elt.toDataURL('image/png');
	let pngData = convertDataURIToBinary(dataURI);
	// console.log(dataURI, pngData);
	ffmpegSaveFrame(frameId, pngData);
}



function ffmpegUtilInit() {
	guiCaptureButtonMP4 = gui.getController('buttonVidCaptureMP4');
	guiCaptureButtonWEBM = gui.getController('buttonVidCaptureWEBM');
}



async function ffmpegInit() {
	ffmpeg = new FFmpeg();

	ffmpeg.on("log", ({ logMsg }) => {
		// console.log(logMsg);
		updateConversionProgress();
	});

	ffmpeg.on("progress", ({ progress, time }) => {
		// console.log(progress, time);
		updateConversionProgress(progress);
	});

	await ffmpeg.load({
		// INCLUDE ROOT OF DOMAIN
		coreURL: (doLoadLocal ?
			(window.location.pathname + "ffmpeg/core/ffmpeg-core.js") : // LOCAL
			(window.location.origin + "/shared-libs/ffmpeg/core/ffmpeg-core.js") // SHARED
		)
	});

	isFfmpegInit = true;
}



function ffmpegSetup() {
	ffmpegUtilInit(); // sync
	ffmpegInit(); // async
}



function updateConversionProgress(progress=undefined) {
	// conversionProgress += dConversionProgress;
	// let s = '';
	// let n = conversionProgress % 30;// round(nmc(conversionProgress) * 25);
	// for (let i = 0; i < n; i++) s += '#';
	// guiCaptureButtonChoice.controllerElement.html(s);
	if (progress === undefined) return;
	
	let progText;
	switch (ffmpegExportSettings.ext) {
	case 'mp4':
		progText = 'Progress: ' + conversionProgress;  
		break;
	case 'webm':
		progText = 'Progress: ' + round(progress * 1000) / 10 + '%';  
		break;
	}
	guiCaptureButtonChoice.controllerElement.html(progText);
}



function ffmpegSaveFrame(frameId, pngData) {
	ffmpeg.createDir('frames');
	let fileName = nf(frameId, 6) + '.png';
	let filePath = 'frames/' + fileName;
	ffmpeg.writeFile(filePath, pngData);
	// console.log(`Written ${filePath}.`);
}



async function getFrameFileNames() {
	let frames = await ffmpeg.listDir('frames');
	frames = frames.filter(item => !item.isDir).map(frame => frame.name);
	// console.log(frames);
	return frames;
}



async function ffmpegCreateMP4() {
	// console.log('Creating MP4...');

	guiCaptureButtonChoice.disable();
	guiVideoLoadingDiv.div.show();

	// create concatenation file list as .txt
	let frames = await getFrameFileNames();
	let inputPaths = frames.map(f => `file frames/${f}`);
	// console.log(inputPaths);
	const concatFile = 'concat_list.txt';
	await ffmpeg.writeFile(concatFile, inputPaths.join('\n'));

	// run ffmpeg concatenation
	const outputFile = 'output.' + ffmpegExportSettings.ext;
	// await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatFile, 'output.mp4']);
	// const args = `-r 30 -f image2 -safe 0 -f concat -i ${concatFile} -progress pipe:2 -vcodec libx264 -pix_fmt yuv420p -crf 21 -vf fps=30.0,scale=1080:1080:flags=lanczos -movflags faststart ${outputFile}`.split(' ');
	const width = canvas.width, height = canvas.height;
	
	// MP4 working:
	let args;
	switch (ffmpegExportSettings.ext) {
	case 'mp4':
		args = `-r ${ffmpegFR} -f image2 -safe 0 -f concat -i ${concatFile} -progress pipe:2 -vcodec libx264 -pix_fmt yuv420p -crf ${ffmpegExportSettings.crf} -vf fps=${ffmpegFR}.0,scale=${width}:${height}:flags=lanczos -movflags faststart ${outputFile}`.split(' ');
		break;
	case 'webm':
		args = `-i frames/%06d.png -progress pipe:2 -r ${ffmpegFR} -crf ${ffmpegExportSettings.crf} -c:v libvpx -pix_fmt yuva420p -auto-alt-ref 0 ${outputFile}`.split(' ');
		break;

	}

	print(args.join(' '));

	let execResult = await ffmpeg.exec(args);
	// console.log(`ffmpeg.exec result: ${execResult}`);
	// console.log('Completed concatenation.');

	// load mp4 to HTML video element
	// console.log('Loading MP4 data...');
	const data = await ffmpeg.readFile(outputFile);
	const video = document.getElementById('output-video');
	const blob = new Blob([data.buffer], {type: ffmpegExportSettings.mimeType});
	console.log(blob);
	const blobURL = URL.createObjectURL(blob);
	video.src = blobURL;
	
	videoDownloadLink = document.getElementById('video-link');
	videoDownloadLink.innerHTML = 'Download video';
	videoDownloadLink.title = 'download';
	videoDownloadLink.download = Generator.getOutputFileName();
	videoDownloadLink.href = blobURL;
	videoDownloadLink.click(); // auto-download

	guiVideoLoadingDiv.div.hide();
	guiCaptureButtonChoice.controllerElement.html(lang.process('Start LANG_VID_CAPTURE ' + ffmpegExportSettings.ext.toUpperCase(), true));
	guiCaptureButtonChoice.enable();

	// setTimeout(() => alert('De video is gereed en wordt gedownload.'), 50);
	setTimeout(() => alert(lang.process('LANG_VIDEO_READY_MSG', true)), 50);

	// console.log('Clearing frames...');
	clearFramesDir();

	console.log('Created and loaded video.');

	isPlaying = true;
}



async function dir(path) {
	const listdir = await ffmpeg.listDir(path);
	for (let item of listdir) {
		console.log(item.isDir ? 'dir' : 'file', item.name);
	}
}
