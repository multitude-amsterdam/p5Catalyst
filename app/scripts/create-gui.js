function createGUI() {
	if (gui != undefined) gui.div.remove();
	gui = new GUIForP5();

	gui.setLeft();

	// add logo up top (uses 'assets/generator-logo.svg', see style.css)
	let logo = gui.addField(new Field(gui.div, 'logo', ''));

	// ------------------------------ FORMAT ------------------------------
	gui.addTitle(2, 'LANG_FORMAT', false);
	gui.addController(
		new ResolutionSelect(
			gui,
			'Presets:',
			resolutionOptions,
			0,
			(controller, value) => {
				const resBox = gui.getController('resolutionTextboxes');
				if (resBox) resBox.setValueOnlyDisplay(pw, ph);
				generator.setup();
			}
		)
	);
	gui.addController(
		new ResolutionTextboxes(
			gui,
			pw,
			ph,
			(controller, value) => {
				if (
					value.w * value.h < sq(10000) &&
					(value.w != pw || value.h != ph)
				) {
					generator.setup();
				}
			},
			controller => {
				controller.setValueOnlyDisplay(pw, ph);
			}
		)
	);

	// ------------------------------ APPEARANCE ------------------------------
	gui.addDivider();
	gui.addTitle(2, 'LANG_APPEARANCE', false);

	gui.addController(
		new ColourBoxes(
			gui,
			'colourBoxesFgCol',
			'LANG_FGCOL',
			generator.palette,
			0,
			(controller, value) => {
				generator.col = value;
			}
		),
		(doAddToRandomizerAs = true)
	);

	gui.addController(
		new Button(
			gui,
			'buttonRandomize',
			'LANG_RANDOMIZE',
			controller => {
				gui.randomizer.randomize();
				// generator.setup();
			},
			controller => {
				// controller.click(); // randomize on startup
			}
		)
	);

	// ------------------------------ EXPORT ------------------------------
	gui.addDivider();
	gui.addTitle(2, 'LANG_EXPORT', false);

	gui.addTitle(3, 'LANG_IMAGE', false);

	gui.addController(
		new Button(
			gui,
			'buttonCopyPNG',
			'LANG_COPY_TO_CLIPBOARD',
			controller => {
				copyCanvasToClipboard();
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	gui.addController(
		new Button(
			gui,
			'buttonDownloadPNG',
			'Download PNG',
			controller => {
				save(Generator.getOutputFileName() + '.png');
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	// gui.addController(new Button(
	//   gui, 'buttonDownloadSVG', 'Download SVG',
	//   (controller) => {
	//     generator.draw(doSVGToo=true);
	//     svgCanvas.save(Generator.getOutputFileName() + '.svg');
	//   }
	// ));

	gui.addDivider();

	gui.addTitle(3, 'LANG_VIDEO', false);

	gui.addController(
		new Slider(
			gui,
			'sliderSpeed',
			'LANG_SPEED',
			0.25,
			2.5,
			speed,
			0.25,
			(controller, value) => {
				speed = value; //pow(2, value * 2);
				controller.label.div.html(
					lang.process(`LANG_SPEED: ${speed} x`, true)
				);
			}
		),
		(doAddToRandomizerAs = false)
	);

	gui.addController(
		new Slider(
			gui,
			'sliderVidDuration',
			'LANG_VID_DURATION',
			1,
			30,
			round(duration),
			1,
			(controller, value) => {
				setDuration(value);
				controller.label.div.html(
					lang.process(`LANG_VID_DURATION: ${value} s`, true)
				);
			}
		),
		(doAddToRandomizerAs = false)
	);

	// ffmpeg.js var
	guiCaptureButtonMP4 = gui.addController(
		new Button(
			gui,
			'buttonVidCaptureMP4',
			lang.process('Start LANG_VID_CAPTURE MP4'),
			controller => {
				guiCaptureButtonChoice = guiCaptureButtonMP4;
				ffmpegExportSettings = MP4;
				if (!isCapturingFrames) {
					startCapture();
					controller.controllerElement.html(
						lang.process('Stop LANG_VID_CAPTURE')
					);
				} else {
					stopCapture();
					controller.controllerElement.html(
						lang.process('Start LANG_VID_CAPTURE')
					);
					clearFramesDir();
					isPlaying = true;
				}
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	// ffmpeg.js var
	guiCaptureButtonMP4WEBM = gui.addController(
		new Button(
			gui,
			'buttonVidCaptureWEBM',
			lang.process('Start LANG_VID_CAPTURE (transparent WEBM)'),
			controller => {
				guiCaptureButtonChoice = guiCaptureButtonWEBM;
				ffmpegExportSettings = WEBM_TRANSPARENT;
				print(ffmpegExportSettings);
				if (!isCapturingFrames) {
					startCapture();
					controller.controllerElement.html(
						lang.process('Stop LANG_VID_CAPTURE (transparent WEBM)')
					);
				} else {
					stopCapture();
					controller.controllerElement.html(
						lang.process(
							'Start LANG_VID_CAPTURE (transparent WEBM)'
						)
					);
					clearFramesDir();
					isPlaying = true;
				}
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	// ffmpeg.js var
	guiVideoLoadingDiv = gui.addField(
		new Field(gui.div, 'vidLoad', '', 'Video verwerken...')
	);
	guiVideoLoadingDiv.div.hide();
	let loaderDiv = createDiv();
	loaderDiv.parent(guiVideoLoadingDiv.div);

	// ------------------------------ SETTINGS ------------------------------
	gui.addDivider();
	gui.addTitle(2, 'LANG_SETTINGS', false);

	gui.addController(
		new Button(
			gui,
			'buttonUndo',
			'LANG_UNDO',
			controller => {
				changeSet.undo();
			},
			controller => {
				controller._doUpdateChangeSet = false;
				controller.controllerElement.elt.title = 'CTRL/CMD + Z';
			}
		)
	);

	gui.addController(
		new Button(
			gui,
			'buttonRedo',
			'LANG_REDO',
			controller => {
				changeSet.redo();
			},
			controller => {
				controller._doUpdateChangeSet = false;
				controller.controllerElement.elt.title = 'CTRL/CMD + SHIFT + Z';
			}
		)
	);

	gui.addDivider();

	gui.addController(
		new Button(
			gui,
			'buttonSaveSettings',
			'LANG_SAVE_SETTINGS',
			controller => {
				const fileName = dialog
					.prompt(lang.process('LANG_CHOOSE_FILE_NAME_MSG', true))
					.then(fileName => {
						changeSet.download(fileName);
					});
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	gui.addController(
		new JSONFileLoader(
			gui,
			'jsonFileLoaderSettings',
			'LANG_LOAD_SETTINGS',
			(controller, file) => {
				print(controller, file);
				controller.setConsole(controller.fileName, '');
				changeSet.loadFromJSON(JSON.stringify(file.data));
			},
			controller => {
				controller.controllerElement.elt.accept += ',.settings';
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	gui.addDivider();

	gui.createDarkModeButton();

	// ------------------------------ SUPPORT ------------------------------
	gui.addDivider();
	gui.addTitle(3, 'LANG_SUPPORT', false);

	gui.addController(
		new Button(gui, 'buttonHelpMe', 'LANG_HELP', controller => {
			helpMe();
		})
	);

	if (Generator.supportEmail?.indexOf('@') > -1) {
		let contactField = gui.addHTMLAsNewField(
			lang.process(
				`<a href="mailto:${Generator.supportEmail}` +
					`?subject=${Generator.name}` +
					`">LANG_CONTACT_MSG</a>`
			)
		);
		contactField.div.id('contact');
		contactField.div.parent(gui.div);
	}

	gui.addP5CatalystLogo();

	// initialize randomly
	// gui.randomizer.randomize();

	gui.setup();
}

const resolutionOptions = [
	'Full-HD (1080p) LANG_PORTRAIT: 1080 x 1920',
	'Full-HD (1080p) LANG_LANDSCAPE: 1920 x 1080',
	'4K-Ultra-HD (2160p): 3840 x 2160',

	'Instagram post LANG_PORTRAIT: 1080 x 1350',
	'(Instagram post LANG_SQUARE): 1080 x 1080',
	'Instagram story: 1080 x 1920',

	'Facebook post LANG_LANDSCAPE: 1200 x 630',
	'Facebook post LANG_PORTRAIT: 630 x 1200',
	'Facebook post LANG_SQUARE: 1200 x 1200',
	'Facebook story: 1080 x 1920',
	'Facebook cover photo: 851 x 315',

	'X post LANG_LANDSCAPE: 1600 x 900',
	'X post LANG_PORTRAIT: 1080 x 1350',
	'X post LANG_SQUARE: 1080 x 1080',
	'X cover photo: 1500 x 500',

	'Linkedin LANG_PROFILEPIC: 400 x 400',
	'Linkedin cover photo: 1584 x 396',
	'Linkedin image post: 1200 x 628',

	'Mastodon post LANG_LANDSCAPE: 1280 x 720',
	'Mastodon post LANG_SQUARE: 1200 x 1200',

	'BlueSky post LANG_LANDSCAPE: 1200 x 675',
	'BlueSky post LANG_SQUARE: 1200 x 1200',
	'BlueSky header: 1500 x 500',

	'YouTube LANG_PROFILEPIC: 800 x 800',
	'YouTube banner: 2048 x 1152',
	'YouTube thumbnail: 1280 x 720',
	'YouTube shorts/stories: 1080 x 1920',

	'TikTok LANG_PORTRAIT: 1080 x 1920',
	'TikTok LANG_SQUARE: 1080 x 1080',

	'PowerPoint: 1920 x 1080',

	getAPaperResolutionOptionAtDpi(5, 300),
	getAPaperResolutionOptionAtDpi(4, 300),
	getAPaperResolutionOptionAtDpi(3, 300),
	getAPaperResolutionOptionAtDpi(2, 300),
	getAPaperResolutionOptionAtDpi(1, 300),
	getAPaperResolutionOptionAtDpi(0, 300),
	getAPaperResolutionOptionAtDpi(5, 300, false),
	getAPaperResolutionOptionAtDpi(4, 300, false),
	getAPaperResolutionOptionAtDpi(3, 300, false),
	getAPaperResolutionOptionAtDpi(2, 300, false),
	getAPaperResolutionOptionAtDpi(1, 300, false),
	getAPaperResolutionOptionAtDpi(0, 300, false),
];

function getAPaperResolutionOptionAtDpi(aNumber, dpi, isPortrait = true) {
	// A0 paper size in mm
	const baseWidth = 841;
	const baseHeight = 1189;
	const factor = Math.pow(2, aNumber / 2);
	const wMm = Math.floor(baseWidth / factor);
	const hMm = Math.floor(baseHeight / factor);
	const wPx = Math.round((wMm / 25.4) * dpi);
	const hPx = Math.round((hMm / 25.4) * dpi);
	return (
		`A${aNumber} ${
			isPortrait ? 'LANG_PORTRAIT' : 'LANG_LANDSCAPE'
		} @ ${dpi} DPI: ` +
		`${isPortrait ? wPx : hPx} x ${isPortrait ? hPx : wPx}`
	);
}
