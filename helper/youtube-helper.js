const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const {ffmpegPath, outputPath} = require("../config.json");

const YD = new YoutubeMp3Downloader({
    "ffmpegPath": ffmpegPath,        // FFmpeg binary location
    "outputPath": outputPath,    // Output file location (default: the home directory)
    "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
    "queueParallelism": 2,                  // Download parallelism (default: 1)
    "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
    "allowWebm": false                      // Enable download from WebM sources (default: false)
});

function getVideoId(url) {
    let regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
}

function downloadVideo(url, callback) {
    let id = getVideoId(url);
    YD.download(id, id + ".mp3");
    YD.on("finished", async function (err, data) {
        callback(err, data);
    });
}

module.exports = {
    downloadVideo,
    getVideoId
}