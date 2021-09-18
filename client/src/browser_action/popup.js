

// var b = document.getElementById("demo");
// b.addEventListener("click", function(){console.log("Hello");})

// Add a button listener 
document.addEventListener(
    "DOMContentLoaded",
    async () => {
      const button = document.getElementById("capture-btn");
      button.addEventListener(
        "click",
        () => {
            chrome.extension.getBackgroundPage().console.log("hello");
            // Launch the screen capture
            button.innerHTML = "Capturing..."


            // function modifyDOM() {
            //     //You can play with your DOM here or check URL against your regex
            //     chrome.extension.getBackgroundPage().console.log('Tab script:');
            //     chrome.extension.getBackgroundPage().console.log(document.body);
            //     return document.body.innerHTML;
            // }
        
            // //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
            // chrome.tabs.executeScript({
            //     code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
            // }, (results) => {
            //     //Here we have just the innerHTML and not DOM structure
            //     chrome.extension.getBackgroundPage().console.log('Popup script:')
            //     chrome.extension.getBackgroundPage().console.log(results[0]);
            // });
    

            // Test communicating with backend
            fetch('http://localhost:8000/process', {
                method: 'POST',
                body: ""
            })
            .then(response => response.json())
            .then(result => {
                chrome.extension.getBackgroundPage().console.log('Success:', result);

                // Update the extension UI
                var notes = document.getElementById('notes')
                for (let line of result['lines']) {
                    notes.innerHTML += line['text']
                    notes.innerHTML += '<br>'
                }
                
                // List out detected entities and fetch corresponding wiki page
                var entities = document.getElementById('entities')
                for (let line of result['entities']) {

                    var wiki_link = `https://en.wikipedia.org/wiki/${line['entity']}`

                    var iframe = document.createElement('iframe'); 
                    iframe.style.background = "white";
                    iframe.style.height = "100%";
                    iframe.style.width = "50px";
                    iframe.style.position = "fixed";
                    iframe.style.top = "0px";
                    iframe.style.right = "0px";
                    iframe.frameBorder = "none"; 
                    iframe.src = wiki_link
                    
                    






                    entities.innerHTML += `<a href="${wiki_link}" target="_blank">${line['entity']}</a> (${line['label']})`
                    entities.innerHTML += '<br>'
                    entities.innerHTML += `
                        <div class="box" id="${'box_'+wiki_link}">
                        </div> 
                    `

                    var boxDiv = document.getElementById('box_'+wiki_link)
                    
                    boxDiv.appendChild(iframe);

                }

                var summary = document.getElementById('summary')
                summary.innerHTML += result['summary']

            })
            .catch(error => {
                chrome.extension.getBackgroundPage().console.error('Error:', error);
            });
        },
        false
      );
    },
    false
  );