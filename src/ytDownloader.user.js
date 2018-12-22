// ==UserScript==
// @name        Xmillsa's Youtube Downloader
// @version     0.0.6
// @namespace   https://andys-net.co.uk/
// @author      Xmillsa
// @grant       none
// @match       https://www.youtube.com/*
// @homepageURL https://andys-net.co.uk/
// ==/UserScript==

(function(){
    "use strict";
    
    async function getVideoDetails(){
        let 
        return new Promise( resolve => {
            setTimeout(() => {
                const id = String( /(?![\?v=]).*?(?=&|$)/i.exec( window.location.search ));
                if ( id[ 0 ] !== '' ){
                    resolve( id );
                }else{
                    throw new Error( 'Link not valid' );
                }
            }, 1000);
        });
    }
    
    // Is there a video?
    // Get video data.
    // Use data to make links.
    // Display links.
    
    let ytd = {
        videoID: '',
        videoObj: {},
        formats: [],
        adaptive: [],
        container: null,

        // Gets the current videos ID.
        getVideoID: function(){
            return new Promise(function(resolve, reject){
                if (document.querySelector('[video-id]') === null){
                    // Doesn't exist yet...
                    reject('Can\'t find a video, trying again in .5 seconds.');
                }else{
                    // Store the video ID.
                    // this.videoID = document.querySelector('[video-id]').getAttribute('video-id');
                    this.videoID = /(?![\?v=]).*?(?=&|$)/i.exec(window.location.search);
                    resolve();
                }
            }.bind(this));
        },

        // Let's get some details!
        getVideoDetails: function(){
            console.log('Get video details');
            return new Promise(function(resolve, reject){
                fetch('https://www.youtube.com/get_video_info?video_id='+ this.videoID +'&el=detailpage', {method: 'GET'})
                .then(r => r.text())
                .then(r => {
                    // Store some info.
                    this.videoObj = JSON.parse(decodeURIComponent(String(/player_response=[^&]*/i.exec(r)).replace('player_response=', '')));
                    this.formats = this.videoObj.streamingData.formats;
                    this.adaptive = this.videoObj.streamingData.adaptiveFormats;
                    // Carry on.
                    resolve();
                })
                .catch(e => {
                    console.error(e);
                    console.error('https://www.youtube.com/get_video_info?video_id='+ this.videoID +'&el=detailpage');
                    reject('There was an error with the fetch request... trying again.');
                });
            }.bind(this));
        },

        makeButtons: function(){
            // Check we have a container to put our links.
            if (this.container === null){
                console.log('Container Missing, Creating...');
                this.createContainer();
                return;
            }
            
            this.formats.sort((a, b) => {
                return parseInt(b.contentLength) - parseInt(a.contentLength);
            });
            this.adaptive.sort((a, b) => {
                return parseInt(b.contentLength) - parseInt(a.contentLength);
            });
            
            let i = 0;
            for(; i < this.formats.length; i++){
                let a = this.createALink( this.formats[ i ] );

                document.getElementById('andyLeft').appendChild(a);
                document.getElementById('andyLeft').appendChild(document.createElement('br'));
            }
            
            i = 0;
            for(; i < this.adaptive.length; i++){
                let a = this.createALink( this.adaptive[ i ] );

                document.getElementById('andyRight').appendChild(a);
                document.getElementById('andyRight').appendChild(document.createElement('br'));
            }
        },

        // This creates a container for our buttons.
        createContainer: function(){
            // Check it doesn't already exist.
            if (document.getElementById('andysContainer') === null){
                const div = document.createElement('div'),
                      target = document.getElementById('player');

                // Check our target exists.
                if (target !== null){
                    div.className = 'style-scope ytd-watch-flexy';
                    div.id = 'andysContainer';
                    
                    div.innerHTML = '<div id="andyLeft"></div><div id="andyRight"></div>';
                    
                    target.parentNode.insertBefore(div, target.parentNode.querySelector('#meta'));
                    this.container = div;
                }
            }
            this.makeButtons();
        },

        /*
            Creates our <a> links ready to be put into the page!
        */
        createALink: function( format ){
            // Create a button for each format.
            let a = document.createElement('a'),
                mime = format['mimeType'].split(';')[0],
                qual = format['qualityLabel'],
                size = Number(format['contentLength'] / 1024 / 1024).toFixed(2);
            
            a.title = format['mimeType'];
            
            switch (mime){
                case 'video/3gpp':
                    a.innerText = qual +' .3gp';
                break;
                case 'video/mp4':
                    a.innerText = qual +' .mp4';
                break;
                case 'video/webm':
                    a.innerText = qual +' .webm';
                break;
                case 'audio/mp4':
                    a.innerText = 'Audio Only .m4a';
                break;
                case 'audio/webm':
                    a.innerText = 'Audio Only .webm';
                break;
                default:
                    a.innerText = qual +' Unknown Type?!';
            }
            
            a.innerText += ', Size: '+ size +'MB';
            a.target = '_blank';
            a.download = document.title.replace(' - YouTube', '').replace('(', '').replace(')', '');
            a.href = format['url'];
            
            return a;
        },
        
        reset: function(){
            if (this.container !== null){
                this.container.remove();
            }
            // Reset vars.
            this.videoID = '';
            this.videoObj = {};
            this.formats = [];
            this.adaptive = [];
            this.container = null;
        },

        // The PROCESS
        process: function(){
            
            // Reset.
            this.reset();
            
            // Check we're on a watch?v= page.
            if (/watch\?v/.test(window.location.href)){
                this.getVideoID()
                .then(() => {
                    // We have an ID, lets fetch it's info!
                    console.log('Found the video!');
                    this.getVideoDetails()
                    .then(() => {
                        console.log('Make buttons.');
                        this.makeButtons();
                    })
                    .catch(e => {
                        console.log(e);
                        // Try again?
                        setTimeout(this.process.bind(this), 500);
                    });
                })
                .catch(e => {
                    console.error(e);
                    // Try again?
                    setTimeout(this.process.bind(this), 500);
                });
            }
        }

    };

    /*
      Let's look for some page changes.
    */
    let oldURL = '',
        newURL = window.location.href;

    //setInterval(loopyLoops, 100);
    // Check for changes.
    function loopyLoops(){
        newURL = window.location.href;
        // We've moved pages, start the PROCESS.
        if (oldURL !== newURL){
            console.log('New page!');
            oldURL = window.location.href;
            ytd.process();
        }
    }
    
    const css = `
    #andysContainer{
        margin-top:26px;
        font-size:1.3em;
        display:flex;
        justify-content:space-evenly;
        width:100%;
    }
    #andysContainer a{
        color: #a92;
    }`;
    
    const style = document.createElement('style');
    style.innerText = css;
    document.head.appendChild(style);
}());