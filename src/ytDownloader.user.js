// ==UserScript==
// @name        Xmillsa's Youtube Downloader
// @version     0.1.1
// @namespace   https://andys-net.co.uk/
// @author      Xmillsa
// @grant       none
// @match       https://www.youtube.com/*
// @homepageURL https://andys-net.co.uk/
// ==/UserScript==

(function (){
    "use strict";

    let currURL = window.location.href,
        prevURL = '';

    // Always check the URL for changes.
    setInterval( checkURL, 50 );

    /*
        Keep an eye on the URL for any changes, if it changes, run the main function.
    */
    function checkURL(){
        // Current URL.
        currURL = window.location.href;
        // Has it changed?
        if ( prevURL !== currURL ){
            // Match the previous and current URLs so we don't loop forever and ever!
            prevURL = window.location.href;
            // Lets begin.
            main();
        }
    }

    /*
        The main function, everything is done through this function.
        First we check if we're on the correct page,
        Add some custom CSS styles,
        Create the container for our links,
        Grab the video ID from the URL,
        Fetch the videos details and await its arrival,
        Turn that data into something usable,
        Create the actual links and visile data.
    */
    async function main(){
        try{
            // Check we're on the correct page.
            if ( window.location.href.includes( 'watch?v=' ) ){

                // Add some styling.
                addCss();

                // Create our container/button.
                createContainer();

                // Get the current video ID from the URL.
                const videoID  = /(?:\?v=)(.*?)(?:&|$)/i.exec(window.location.search)[1],
                      response = await fetch( `https://www.youtube.com/get_video_info?video_id=${videoID}&el=detailpage`, { method: 'GET' } ),
                      data     = await response.text();

                // Parse the data so we can use it.
                const json     = parseData( data );

                // Create the links.
                createLinks( json );
            } else {
                console.log( 'No video here.' );
            }
        }
        catch(e){
            // Just errors, errors everywhere!
            console.log(e);
        }
    }

    /*
        Grabs the required sections of data from the fetch response.
        We only require the "player_response" section, once found, turn it into JSON for easy use.
    */
    function parseData( data ){
        let captured = /(?:player_response=)(.*?)(?:&|$)/i.exec( data )[ 1 ],
            json     = JSON.parse(decodeURIComponent( captured ) );

        return json;
    }

    /*
        This creates a container for basically everything regarding this script.
        First ensure it doesn't already exist, (if it does we simply reset it),
        Create the container element, set some basic attributes,
        Add an event listener on the button to show/hide the links,
        Add the container to the page.
    */
    async function createContainer(){
        // Check it's not already been created.
        if ( document.getElementById( 'yt-container' ) === null ){
            console.log( 'Create Container' );
            const target  = await findTheTarget( '#primary #player' ),
                  div     = document.createElement( 'div' );

            // Set the div's attributes.
            div.id        = 'yt-container';
            div.className = 'style-scope ytd-watch-flexy';
            div.innerHTML = '<button>Download Links</button><div id="yt-links"><div><h3>Video & Audio Combined</h3><div id="combined"></div></div><div class="flex"><div><h3>Video Only - No Audio</h3><div id="seperate-video"></div></div><div><h3>Audio Only - No Video</h3><div id="seperate-audio"></div></div></div></div>';

            div.getElementsByTagName( 'button' )[ 0 ].addEventListener( 'click', () => {
                // Do some magic to allow for a variable number of links. (overall container height)
                if (div.classList.contains('open') === false){
                    let currentHeight = div.clientHeight;
                    // Work out required height.
                    // Temporarily disable transitions.
                    div.style.transitionDuration = '0s';
                    // Set height to auto, and store it's height.
                    div.style.height = 'auto';
                    let setHeight = div.clientHeight;
                    // Set height back to it's original height.
                    div.style.height = currentHeight +'px';
                    // Force a redraw otherwise it simply wont work.
                    div.offsetHeight;
                    // Re-enable transitions.
                    div.style.transitionDuration = '';
                    // Tell it the new height we worked out. (the transition takes care of the rest)
                    div.style.height = setHeight +'px';
                } else {
                    // Use CSS styling.
                    div.removeAttribute('style');
                }
                // div.removeAttribute('style');
                div.classList.toggle( 'open' );
            });

            target.parentNode.insertBefore(div, target.nextSibling);
        } else {
            // It already exists, just reset it.
            // Remove inline styles.
            document.querySelector( '#yt-container' ).removeAttribute( 'style' );
            // Remove all class.
            document.querySelector( '#yt-container' ).removeAttribute( 'class' );
            // Empty the #combined div.
            document.querySelector( '#yt-container #combined' ).innerText = '';
            // Empty the #seperate div.
            document.querySelector( '#yt-container #seperate-audio' ).innerText = '';
            // Empty the #seperate div.
            document.querySelector( '#yt-container #seperate-video' ).innerText = '';
        }
    }

    /*
        This simply finds the requested target, used as a promise to allow waiting.
        Probably overkill but it just felt right making it this way.
        Will simply wait... forever, until the target is found.
        This hasn't been tested for forced errors, so oould break, has worked every time in testing, so far...
    */
    function findTheTarget( target ){
        return new Promise( resolve => {
            // Look for our target.
            const findingInt = setInterval( () => {
                if (document.querySelector( target ) !== null){
                    clearInterval( findingInt );
                    resolve( document.querySelector( target ) );
                } else {
                    console.log( 'nope' );
                }
            }, 500 );
        });
    }

    /*
        Creates all the information and download links for the parsed JSON data.
        Stores the 2 types of videos, "formats" and "adaptive" into arrays,
        will then sort those into ascending order of "contentLength" (Filesize),
        then simply loops through the arrays, sedns each entry to the "displayInfo" function,
        then adds the returned element to the page.
    */
    function createLinks( json ){
              // Store the combined video formats.
        const formats  = json.streamingData.formats,
              // Store the seperate video & audio formats.
              adaptive = json.streamingData.adaptiveFormats,
              // Store Video only.
              adaptiveVideo = [],
              // Store Audio only.
              adaptiveAudio = [];

        let i = 0;
        // Loops through the adaptive array and stores the audio and video links seperately.
        for( ; i < adaptive.length; i++ ){
            if ( adaptive[ i ].mimeType.split( ';' )[ 0 ].split( '/' )[ 0 ] === 'audio' ){
                // Send to Audio only array.
                adaptiveAudio.push( adaptive[ i ] );
            } else {
                // Send to video only array.
                adaptiveVideo.push( adaptive[ i ] );
            }
        }
        // Sorts the "adaptiveAudio" array by content length (filesize)
        adaptiveAudio.sort((a, b) => {
            return parseInt(b.contentLength) - parseInt(a.contentLength);
        });
        // Sorts the "adaptiveVideo" array by content length (filesize)
        adaptiveVideo.sort((a, b) => {
            return parseInt(b.contentLength) - parseInt(a.contentLength);
        });
        // Sorts the "formats" array by content length (filesize)
        formats.sort((a, b) => {
            return parseInt(b.contentLength) - parseInt(a.contentLength);
        });

        /*
            Loop through the previously made, now sorted arrays and display the required infomation.
        */
        let row, target, i;

        i = 0;
        target = document.querySelector('#yt-container #combined');
        for( ; i < formats.length; i++ ){
            row = displayInfo( formats[ i ] );
            target.appendChild( row );
        }

        i = 0;
        target = document.querySelector('#yt-container #seperate-audio');
        for( ; i < adaptiveAudio.length; i++ ){
            row = displayInfo( adaptiveAudio[ i ] );
            target.appendChild( row );
        }

        i = 0;
        target = document.querySelector('#yt-container #seperate-video');
        for( ; i < adaptiveVideo.length; i++ ){
            row = displayInfo( adaptiveVideo[ i ] );
            target.appendChild( row );
        }
    }

    /*
        Turns the individual JSON entry into a div row for displaying on page.
        Get all the vars, quality, mimetype & size.
        Work out "3gp" and "m4a" seperately, all the others can be extracted from the mimetype entry itself,
        Create the div row element with the extracted data.
        return the div.
    */
    function displayInfo( data ){
        let row       = document.createElement( 'div' ),
            qual      = data['qualityLabel'],
            mime      = data[ 'mimeType' ].split( ';' )[ 0 ].split( '/' ),
            size      = Number(data['contentLength'] / 1024 / 1024).toFixed(2),
            type      = mime[ 1 ];

        if ( mime[ 0 ] === 'video' ){
            switch( mime[ 1 ] ){
                case '3gpp':
                    type = '3gp';
                break;
            }
        }
        if ( mime[ 0 ] === 'audio' ){
            switch( mime[ 1 ] ){
                case 'mp4':
                    type = 'm4a';
                break;
            }
        }

        // Convert to Kbs for easier reading.
        if (qual === undefined){
            qual = String(Number(data[ 'averageBitrate' ] / 1024 ).toFixed(0)) +' Kbs';
        }

        row.className = 'row';
        row.innerHTML = `<div class="right">${size} MB</div>
                         <div class="center">${qual}</div>
                         <div class="left">
                             <a href='${data[ 'url' ]}' download target="_blank" title='${data[ 'mimeType' ].split( ';' )[0].split( '/' )[1]}'>Download ${type}</a>
                         </div>`;
        return row;
    }

    /*
        Some custom CSS for the container, button and links.
        Uses some of Youtubes own CSS vars, ensures it works with youtubes Dark Theme mode without me writting extra css.
    */
    function addCss(){
        // Check it's not already been added.
        if (document.getElementById( 'yt-downloader-styles' ) === null ){
            const css = `
                  #yt-container *{box-sizing:border-box}
                  #yt-container{color:var(--ytd-video-primary-info-renderer-title-color,var(--yt-spec-text-primary));font-size:1.3em;height:20px;margin-top:.4em;min-height:20px;overflow:hidden;position:relative;transition:height .4s}
                  #yt-container > button{background-color:transparent;border:none;color:var(--yt-spec-text-secondary);cursor:pointer;height:18px;margin:0;padding:0;position:relative;transition:box-shadow .2s;user-select:none;width:100%;z-index:1}
                  #yt-container > button::before{content:'<';left:5px;position:absolute;transform:rotate(-90deg);transition:transform .4s}
                  #yt-container > button::after{content:'>';position:absolute;right:5px;transform:rotate(90deg);transition:transform .4s}
                  #yt-container.open > button::before{transform:rotate(90deg)}
                  #yt-container.open > button::after{transform:rotate(-90deg)}
                  #yt-container > button:active{margin:0;padding:0}
                  #yt-container > button:hover,#yt-container.open > button{box-shadow:0 2px 0 0 var(--yt-spec-10-percent-layer)}
                  #yt-container > #yt-links{display:flex;flex-direction:column;justify-content:space-evenly;position:relative;width:100%}
                  #yt-container > #yt-links div{width:100%}
                  #yt-container > #yt-links > div.flex{display:flex;flex-direction:row;justify-content:space-evenly;margin-top:.4em}
                  #yt-container a{color:var(--yt-endpoint-color,var(--yt-spec-icon-active-button-link))}
                  #yt-container h3{font-weight:300;margin:0;padding:.2em 0;text-align:center}
                  #yt-container .row{display:flex;justify-content:space-evenly}
                  #yt-container .row div{width:33%}
                  #yt-container .right{text-align:right}
                  #yt-container .left{text-align:left}
                  #yt-container .center{text-align:center}
                  ytd-video-primary-info-renderer{padding-top:10px}
                  `,
                  style = document.createElement( 'style' );

            style.id = 'yt-downloader-styles';
            style.innerText = css;
            document.head.appendChild( style );
        }
    }
}());