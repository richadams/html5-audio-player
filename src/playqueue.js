// A player queue, keeps upcoming tracks to be played.
function PlayQueue(config)
{
    // Members
    this.queue    = Array(); // The queue of Track items.
    this.size     = 0;       // Current size of the queue.
    this.playing  = false;   // Flag to see if we're already playing back the queue.

    // Callback functions
    this.popCallback    = null;
    this.pushCallback   = null;
    this.removeCallback = null;
    this.clearCallback  = null;
    this.emptyCallback  = null;

    // Configuration
    this.maxSize        = 50; // Max number of items allowed in the queue.

    // Constructor
    this._construct = function _construct(config)
    {
        // Setup config if user defined one exists.
        if (typeof config != "undefined")
        {
            // Setup callbacks.
            if (typeof config.popCallback == "function")    { this.popCallback    = config.popCallback; }
            if (typeof config.pushCallback == "function")   { this.pushCallback   = config.pushCallback; }
            if (typeof config.removeCallback == "function") { this.removeCallback = config.removeCallback; }
            if (typeof config.clearCallback == "function")  { this.clearCallback  = config.clearCallback; }
            if (typeof config.emptyCallback == "function")  { this.emptyCallback  = config.emptyCallback; }

            // Setup other misc config.
            if (typeof config.maxSize != "undefined")       { this.maxSize        = config.maxSize; }
        }
    }

    // Generates a unique identifier
    this.generateIdentifier = function()
    {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    // This initiates playback of the queue if it's not already playing back a track.
    this.triggerPlayback = function triggerPlayback()
    {
        // Break out if we're already playing.
        if (this.playing) { return; }

        // Otherwise, pop the next item, this should begin playback.
        this.pop();
        this.playing = true;
    }

    // Adds a new item to the play queue
    this.push = function(track)
    {
        // This will be our unique queue item identifier. (aka qiid).
        var qiid = this.generateIdentifier();

        console.log("[playqueue/push] Adding track to queue (qiid=" + qiid + ", pos=" + this.size + ", track.id=" + track.id + ")");

        // Determine if the queue is full and fail fast.
        if (this.size >= this.maxSize)
        {
            error("[playqueue/push] queue is full, max size reached (max=" + this.maxSize + ")");
            return;
        }

        // Actually add the item to the queue.
        this.queue[qiid] = track;

        // Call the callback to trigger any page updates or animations.
        if (typeof this.pushCallback == "function") { this.pushCallback(qiid, track); }

        // Increase the queue size
        this.size++;
    }

    // This will pop the top item from the queue and begin playback of it.
    this.pop = function()
    {
        console.log("[playqueue/pop] Popping top item from the play queue.");

        // Check if there's actually an item!
        if (this.size == 0)
        {
            console.log("[playqueue/pop] No item to pop. Queue is empty.");
            if (typeof this.emptyCallback == "function") { this.emptyCallback(); }
            this.playing = false;
            return;
        }

        // If there is an item, then we need to start playback.
        var track = null, qiid = null;
        for (var t in this.queue)
        {
            track = this.queue[t];
            qiid  = t;
            break;
        }

        // Safety check
        if (track == null) { error("[playqueue/pop] Track is null, this shouldn't happen."); }

        console.log("[playqueue/pop] Popping item from queue (qiid=" + qiid + ", track.id=" + track.id + ")");

        // Callback should initiate playback
        if (typeof this.popCallback == "function") { this.popCallback(qiid, track); }

        this.playing = true;

        // Remove the item from the queue.
        this.remove(qiid, false);
    }

    // This will skip to a certain track in the list. Basically, pop until you hit the item or
    // the end of the list.
    this.skipTo = function(qiid)
    {
        for (var q in this.queue) { if (q != qiid) { this.pop(); } else { break; } }
    }

    // This completely clears the queue.
    this.clear = function clear()
    {
        console.log("[playqueue/clear]");

        // Clear the queue and update the size.
        this.queue = Array();
        this.size  = 0;
        this.playing = false;

        // Trigger the callback
        if (typeof this.clearCallback == "function") { this.clearCallback(); }
    }

    // This will remove a single item from the queue based on queue item identifier.
    this.remove = function remove(qiid)
    {
        // Safety check
        if (typeof this.queue[qiid] == "undefined"
            && this.queue[qiid].length != 0) { return; }

        console.log("[playqueue/remove] Removing (qiid=" + qiid + ")");
        delete this.queue[qiid];
        this.size--;

        // Trigger the callback
        if (typeof this.removeCallback == "function") { this.removeCallback(qiid); }
    }

    // Destructor
    this._destroy = function _destroy()
    {
        console.log("[playqueue/destroy]");
    }

    this._construct(config);
}
