A quick and hacky Javascript music player using the HTML5 audio API.

This is something I put together during a hackathon a while ago, so the code isn't particularly great, but should be good enough for others to use in similar situations.

### Features

* No dependencies (don't need jQuery, etc).
* Simple playlist queue so you can queue up multiple audio files to be played.
* Fade in/out audio at start and end of tracks.
* Callbacks so you can update your UI when various events are triggered (play, pause, progress, etc).

### What Sucks

* Global scope, ew!
* Multiple files to include in your HTML.
* Probably more...

### Basic Usage

    var player    = new Player();
    var playQueue = new PlayQueue({
        popCallback: function(qiid, track)
        {
            player.play(track.audio, track.len);
        }
    });

    // Using an iTunes preview clip as an example.
    playQueue.push(new Track({
        title: "Extreme Ways",
        artist: "Moby",
        len: 30,
        audio: "//a828.phobos.apple.com/us/r30/Music/63/82/d1/mzi.hztoxume.aac.p.m4a"
    }));

    playQueue.pop();
