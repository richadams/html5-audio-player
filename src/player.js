// All of the different player states.
var PlayerState = { IDLE:0, LOADING:1, PLAYING:2, PAUSED:3 };

// The audio player component, pass in callbacks to be able to do stuff.
function Player(config)
{
    // Data about the playing item
    this.uri             = null;  // URI of the audio file to play.
    this.len             = null;  // Length of the track, in seconds.
    this.currentPosition = 0;     // The current position in the track.

    // Data containers.
    this.audio           = null;  // The actual Audio element.

    // Timers
    this.timer           = null;  // Used to keep track of position.
    this.progress        = null;  // The progress bar timer.

    // Current player state.
    this.state           = PlayerState.IDLE;

    // Callback functions
    this.stopCallback     = null;
    this.playCallback     = null;
    this.loadingCallback  = null;
    this.progressCallback = null;
    this.timerCallback    = null;
    this.pauseCallback    = null;

    // Config options
    this.fadeInSpeed      = 50; // Speed at which to fade in/out music. Higher value = slower fade in.
    this.fadeOutSpeed     = 50;

    // Constructor
    this._construct = function _construct(config)
    {
        // Setup config if user defined one exists.
        if (typeof config != "undefined")
        {
            // Setup callbacks.
            if (typeof config.stopCallback == "function")     { this.stopCallback = config.stopCallback; }
            if (typeof config.playCallback == "function")     { this.playCallback = config.playCallback; }
            if (typeof config.loadingCallback == "function")  { this.loadingCallback = config.loadingCallback; }
            if (typeof config.progressCallback == "function") { this.progressCallback = config.progressCallback; }
            if (typeof config.timerCallback == "function")    { this.timerCallback = config.timerCallback; }
            if (typeof config.pauseCallback == "function")    { this.pauseCallback = config.pauseCallback; }

            // Setup other misc config.
            if (typeof config.fadeInSpeed != "undefined")     { this.fadeInSpeed = config.fadeInSpeed; }
            if (typeof config.fadeOutSpeed != "undefined")    { this.fadeOutSpeed = config.fadeOutSpeed; }
        }
    }

    // Getters
    this.getState = function getState() { return this.state; }

    // Starts playing the passed in URI with length.
    this.play = function play(uri, len)
    {
        console.log("[player/play] uri=" + uri + ", len=" + len);

        // Update state
        this.updateState(PlayerState.LOADING);

        // Set the properties
        this.uri = uri;
        this.len = len;

        // If music already playing, pause it and stop playback.
        if (this.audio != null) { this.audio.pause(); }
        if (this.playing) { this.stop(); }

        // Start new music playback
        console.log("[player/play] playback start");
        this.audio = new Audio(this.uri);
        this.audio.play();
        this.audio.volume = 0;
        fadeIn(this.audio, this.fadeInSpeed);

        this.updateState(PlayerState.PLAYING);

        // Position in track information
        this.currentPosition = 1;

        // Now start to continual progress interval loops.
        this.startTimers();
    }

    // Starts all the progress timers.
    this.startTimers = function startTimers()
    {
        var playerObj = this;

        // Clear any current ones
        this.clearTimers();

        // The playback timer loop
        timerFunction = function()
        {
            // If within 5 seconds of end. Start to fade out.
            if (playerObj.currentPosition >= (playerObj.len - 5))
            {
                fadeOut(playerObj.audio, this.fadeOutSpeed);
            }

            if (playerObj.currentPosition >= playerObj.len)
            {
                // Playback is finished.
                console.log("[player/play] playback complete, stopping player.");
                playerObj.stop();
            }

            playerObj.currentPosition = playerObj.currentPosition + 1;

            // Trigger the callback.
            if (typeof playerObj.timerCallback == "function") { playerObj.timerCallback(playerObj.currentPosition); }
        }
        this.timer = setInterval(timerFunction, 1000);

        // Progress timer
        progressFunction = function()
        {
            // Trigger the progress callback
            if (typeof playerObj.progressCallback == "function") { playerObj.progressCallback(playerObj.currentPosition, playerObj.len); }
        }
        this.progress = setInterval(progressFunction, 1000); progressFunction();
    }

    // Clears any active timers
    this.clearTimers = function clearTimers()
    {
        if (this.timer    != null) { clearInterval(this.timer); }
        if (this.progress != null) { clearInterval(this.progress); }
    }

    // Toggles between pause and resume so an external component doesn't need to maintain state.
    this.togglePause = function()
    {
        (this.state == PlayerState.PAUSED) ? this.resume() : this.pause();
    }

    // Pauses the current playback.
    this.pause = function pause()
    {
        console.log("[player/pause] pausing playback");
        if (this.audio == null) { console.log("[player/pause] audio is null, nothing to pause"); return; }
        if (this.state == PlayerState.IDLE)   { console.log("[player/pause] not playing, cannot pause"); return; }
        if (this.state == PlayerState.PAUSED) { console.log("[player/pause] already paused, cannot pause"); return; }

        this.updateState(PlayerState.PAUSED);

        this.clearTimers();
        this.audio.pause();
    }

    // Resumes current playback.
    this.resume = function resume()
    {
        console.log("[player/resume] resuming playback");
        if (this.audio == null) { console.log("[player/resume] audio is null, nothing to resume"); return; }
        if (this.state == PlayerState.PLAYING) { console.log("[player/resume] already playing, nothing to resume"); return; }
        if (this.state == PlayerState.IDLE)    { console.log("[player/resume] player stopped, cannot resume"); return; }

        this.updateState(PlayerState.PLAYING);

        this.audio.play();
        this.startTimers();
    }

    // Will stop playback.
    this.stop = function stop()
    {
        console.log("[player/stop] stopping playback");

        // Stop any players/timers
        this.clearTimers();
        if (this.audio != null) { this.audio.pause(); }

        // Update state
        this.updateState(PlayerState.IDLE);
        this.playingTrack = null;
    }

    // Update state of the player, triggering callbacks as necessary.
    this.updateState = function updateState(newState)
    {
        console.log("[player/updateState] newState=" + newState);
        this.state = newState;

        // Perform any callbacks.
        switch(this.state)
        {
            case PlayerState.IDLE:
                if (typeof this.stopCallback == "function") { this.stopCallback(); }
                break;
            case PlayerState.LOADING:
                if (typeof this.loadingCallback == "function") { this.loadingCallback(); }
                break;
            case PlayerState.PLAYING:
                if (typeof this.playCallback == "function") { this.playCallback(); }
                break;
            case PlayerState.PAUSED:
                if (typeof this.pauseCallback == "function") { this.pauseCallback(); }
                break;
            default:
        }
    }

    // Make sure to stop playback if the player is destroyed.
    this._destroy = function _destroy()
    {
        this.stop();
    }

    this._construct(config);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper function to format a number of seconds into "0:00" format
function formatTime(seconds)
{
    var mins = Math.floor(seconds / 60);
    var secs = seconds - (Math.floor(seconds / 60) * 60); if (secs < 10) { secs = "0" + secs; }
    return "" + mins + ":" + secs;
};

// Helper function to fade in an audio object, slowly increasing it's volume.
function fadeIn(audio, speed)
{
    if (audio.volume < 1)
    {
        setTimeout(function()
        {
            audio.volume += 0.01;
            if (audio.volume <= 0.99) { fadeIn(audio, speed); }
        }, speed);
    }
};

// Slowly decrease the volume of an audio object.
function fadeOut(audio, speed)
{
    if (audio.volume > 0)
    {
        setTimeout(function()
        {
            audio.volume -= 0.01;
            if (audio.volume >= 0.1) { fadeOut(audio, speed); }
        }, speed);
    }
};
