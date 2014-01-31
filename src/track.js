// Encapsulation of a track object.
function Track(data)
{
    // Members
    this.id      = null; // A unique identifier for the track.
    this.artist  = null; // The artist string.
    this.track   = null; // The track title.
    this.len     = null; // The length of the track in seconds.
    this.audio   = null; // URL to audio file.

    // Constructor
    this._construct = function(data)
    {
        // Set data members.
        this.id     = this.generateIdentifier();
        this.artist = data.artist;
        this.track  = data.track;
        this.len    = data.len;
        this.audio  = data.audio;

        console.log("[track/_construct] (id=" + this.getID()
            + ", track=" + this.getTrack()
            + ", artist=" + this.getArtist()
            + ", len=" + this.getLength()
            + ")");
    }

    // Destructor
    this._destroy = function()
    {
        console.log("[track/destroy] destroying track object");
    }

    // Generate a unique identifier
    this.generateIdentifier = function()
    {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    // Getters
    this.getID     = function() { return this.id; }
    this.getArtist = function() { return this.artist; }
    this.getTrack  = function() { return this.track; }
    this.getLength = function() { return this.len; }
    this.getAudio  = function() { return this.audio; }

    this._construct(data);
}
