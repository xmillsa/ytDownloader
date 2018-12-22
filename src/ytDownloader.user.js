// ==UserScript==
// @name        Xmillsa's Youtube Downloader
// @version     0.1.0
// @namespace   https://andys-net.co.uk/
// @author      Xmillsa
// @grant       none
// @match       https://www.youtube.com/*
// @homepageURL https://andys-net.co.uk/
// ==/UserScript==

(function(){
    "use strict";
    
    let currURL = window.location.href,
        prevURL = '';
    
    // Always check the URL for changes.
    setInterval( checkURL, 50 );
    
    function checkURL(){
        // Current URL.
        currURL = window.location.href;
        // Has it changed?
        if (prevURL !== currURL){
            // Match the previous and current URLs so we don't loop forever and ever!
            prevURL = window.location.href;
            // Lets begin.
            main();
        }
    }
    
    async function main(){
        try{
            // Check we're on the correct page.
            if ( window.location.href.includes('watch?v=') ){
                
                // Add some styling.
                addCss();
                
                // Create our container/button.
                createContainer();
                
                // Get the current video ID.
                const videoID  = /(?:\?v=)(.*?)(?:&|$)/i.exec(window.location.search)[1];
                const response = await fetch('https://www.youtube.com/get_video_info?video_id='+ videoID +'&el=detailpage', { method: 'GET' });
                const data     = await response.text();
                
                // Parse the data so we can use it.
                let json     = parseData( data ),
                    // Store the combined video formats.
                    formats  = json.streamingData.formats,
                    // Store the adaptive video formats.
                    adaptive = json.streamingData.adaptiveFormats;
            } else {
                console.log( 'No video here.' );
            }
        }
        catch(e){
            // Just errors, errors everywhere!
            console.log(e);
        }
    }

    // Find the player_reponse section, it's the useful bit.
    function parseData( data ){
        let captured = /(?:player_response=)(.*?)(?:&|$)/i.exec( data )[ 1 ],
            json     = JSON.parse(decodeURIComponent( captured ) );

        return json;
    }
    
    async function createContainer(){
        console.log('Create Container');
        const target = await findTheTarget( '#primary #player' );
        const div    = document.createElement('div');
        
        div.id        = 'yt-container';
        div.className = 'style-scope ytd-watch-flexy';
        div.innerText = 'HELLO';

        target.parentNode.insertBefore(div, target.nextSibling);
    }
    
    function findTheTarget( target ){
        return new Promise(resolve => {
            // Look for our target.
            const findingInt = setInterval( () => {
                if (document.querySelector( target ) !== null){
                    clearInterval( findingInt );
                    resolve( document.querySelector( target ) );
                }
            }, 500 );
        });
    }
    
    function addCss(){
        console.log('Add css');
        const css = `
              #yt-container{
                  margin-top:.4em;
                  font-size:1.3em;
                  display:flex;
                  justify-content:space-evenly;
                  width:100%;
              }
              #yt-container a{
                  color: #a92;
              }
              `,
              style = document.createElement( 'style' );
        
        style.innerText = css;
        document.head.appendChild( style );
    }
}());