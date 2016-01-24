if (intent === "Radio" && confidence > .5) {
  if (res.outcomes[0].entities && res.outcomes[0].entities.length > 0) {
    if (res.outcomes[0].entities.on_off[0].value === 'on') { radio.on(); radioState = 1; console.log('Radio On.') }
    if (res.outcomes[0].entities.on_off[0].value === 'off') { radio.off(); radioState = 0; console.log('Radio Off.') }
  } else { 
    radio.toggle();
    radioState === 1 ? radioState = 0 : radioState = 1; 
    console.log('Radio Toggle.');
  }
} else if (intent === "OpenAir" && confidence > .5) {
  if (radioState === 1) { radio.off(); };
  setTimeout(function () { soundsRadioOpenair.play(); }, 400);
  soundsRadioOpenair.on('complete', function () {
    radio.station(2);
    radioState = 1;
    console.log('Radio play OpenAir.');
    if (radioState === 1) { radio.on(); };
  });
} else if (intent === "NPR" && confidence > .5) {
  if (radioState === 1) { radio.off(); };
  setTimeout(function () { soundsRadioNPR.play(); }, 400);
  soundsRadioNPR.on('complete', function () {
     radio.station(1);
     radioState = 1
     console.log('Radio play NPR.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "WWOZ" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsRadioWWOZ.play(); }, 400);
  soundsRadioWWOZ.on('complete', function () {
     radio.station(4);
     radioState = 1;
     console.log('Radio play WWOZ.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "RadioNext" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsRadioNext.play(); }, 400);
  soundsRadioNext.on('complete', function () {
     radio.next();
     radioState = 1;
     console.log('Radio play next station.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "RadioPrev" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsRadioPrev.play(); }, 400);
  soundsRadioPrev.on('complete', function () {
     radio.prev();
     radioState = 1
     console.log('Radio play previous station.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "RadioVolumeUp" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsRadioVolumeUp.play(); }, 400);
  soundsRadioVolumeUp.on('complete', function () {
     radio.volumeUp();
     console.log('Turning volume up.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "RadioVolumeDown" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsRadioVolumeDown.play(); }, 400);
  soundsRadioVolumeDown.on('complete', function () {
     radio.volumeDown();
     console.log('Turning volume down.');
     if (radioState === 1) { radio.on(); };
  });
} else if (intent === "Shutdown" && confidence > .5) {
  if (radioState === 1) { radio.on(); };
  setTimeout(function () { soundsShutdown.play(); }, 400);
  soundsShutdown.on('complete', function () {
    console.log('Shutting down...'); 
    shutdownNow();
  });
} else if (intent === "WeatherCurrent" && confidence > .5) {
  if (radioState === 1) { radio.off(); };
  getWeather('Denver', function (wx) {
    tts(wx);
  });
  setTimeout(function () {
    if (radioState === 1) { radio.on(); };
  }, 3000);
} else if (intent === "Hello" && confidence > .5) {
  if (radioState === 1) { radio.off(); };
  setTimeout(function () { soundsHello.play(); }, 400);
  soundsHello.on('complete', function () {
    if (radioState === 1) { radio.on(); };
    console.log('Hello');
  });
} else {
  console.log('I\'m not sure what you said. Did you mean: ' + intent + ' (' + confidence + ')');
  new Sound('sounds/custom/i-dont-understand.wav').play();
}