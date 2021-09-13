const servers = {};
const {
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    StreamType,
    AudioPlayerStatus,
} = require('@discordjs/voice');
const fs = require('fs');
const {join} = require('path');
const {downloadVideo, getVideoId} = require("./helper/youtube-helper");

function addConnection(serverGuild, connection) {
    console.log("connection : ", connection);
    let hasConnection = false;
    for (let c of servers[serverGuild].connections){
        if(c.joinConfig.channelId === connection.joinConfig.channelId){
            hasConnection = true;
        }
    }
    if(!hasConnection){
        servers[serverGuild].connections.push(connection);
    }
}

function pause(serverGuild){
    if(!servers[serverGuild].isPlayerPaused){
        servers[serverGuild].player.pause();
        servers[serverGuild].isPlayerPaused = true;
    } else{
        servers[serverGuild].player.unpause();
        servers[serverGuild].isPlayerPaused = false;
    }
}
function next(serverGuild){
    if(servers[serverGuild].queue.length > 0){
        servers[serverGuild].player.play(servers[serverGuild].queue.shift())
        servers[serverGuild].playerIsPlaying = true;
    } else {
        servers[serverGuild].playerIsPlaying = false;
    }
}

function addVideo(serverGuild, url) {
    if (url.includes("youtube") || url.includes("youtu.be")) {
        let id = getVideoId(url);
        console.log("path exist : ", join(__dirname, "/musics/" + id + ".mp3"));
        if (fs.existsSync(join(__dirname, "/musics/" + id + ".mp3"))) {
            console.log("youtube video in cache");
            addVideoToQueue(serverGuild, join(__dirname, "/musics/" + id + ".mp3"));
        } else {
            console.log("youtube video not in cache");
            downloadVideo(url, (err, data) => {
                console.log(data);
                addVideoToQueue(serverGuild, data.file);
            });
        }
    } else {
        console.log("url to get : ", url);
        addVideoToQueue(serverGuild, url);
    }
}

function addVideoToQueue(serverGuild, url) {
    let server = servers[serverGuild];

    server.queue.push(createAudioResource(url, {
        inputType: StreamType.Arbitrary,
    }));
    console.log("server.playerIsPlaying : ", server.playerIsPlaying)
    if(!server.playerIsPlaying){
        server.player.play(server.queue.shift());
        server.playerIsPlaying = true;
    }
}

function getServer(serverGuild) {
    return servers[serverGuild];
}

function initPlayer(serverGuild, connection) {
    servers[serverGuild] = {
        player: createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        }),
        playerIsPlaying: false,
        isPlayerPaused: false,
        connections: [connection],
        queue: []
    };
    servers[serverGuild].player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    });
    servers[serverGuild].player.on(AudioPlayerStatus.Idle, data => {
        console.log("Player Idle");
        console.log("serverGuild : ", serverGuild);
        if(!servers[serverGuild].isPlayerPaused){
            if(servers[serverGuild].queue.length === 0){
                console.log("servers[serverGuild].connections", servers[serverGuild].connections.length)
                for (let c of servers[serverGuild].connections){
                    c.destroy();
                }
                servers[serverGuild].connections = [];
            }
            next(serverGuild);
        }
    });
    servers[serverGuild].player.on(AudioPlayerStatus.AutoPaused, data => {
        console.log("Player AutoPaused");
    });
    servers[serverGuild].player.on(AudioPlayerStatus.Paused, data => {
        console.log("Player Paused");
    });
    servers[serverGuild].player.on(AudioPlayerStatus.Playing, data => {
        console.log("Player Playing");
    });
    return servers[serverGuild].player;
}

function getPlayerOrCreate(serverGuild, connection) {
    let server = getServer(serverGuild);
    if (server?.player) {
        addConnection(serverGuild, connection);
        return server.player;
    }

    return initPlayer(serverGuild, connection);
}

module.exports = {
    addVideo,
    getPlayerOrCreate,
    getServer,
    pause,
    next
}