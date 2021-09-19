

// var b = document.getElementById("demo");
// b.addEventListener("click", function(){console.log("Hello");})




// Add a button listener 
document.addEventListener(
    "DOMContentLoaded",
    async () => {

      // Load data once
      chrome.storage.local.get(["notes_html"], function(result) {
        var notes = document.getElementById('notes-list')
        chrome.extension.getBackgroundPage().console.log("restoring");

        chrome.extension.getBackgroundPage().console.log(result);

        if (result['notes_html'] != null) {

          notes.innerHTML = result['notes_html'];

        }
      });
      chrome.storage.local.get(["entities_html"], function(result) {
        var entities = document.getElementById('entities-list')
        if (result['entities_html'] != null){
          entities.innerHTML = result['entities_html'];

        }
      });
      chrome.storage.local.get(["summary_html"], function(result) {
        var summary = document.getElementById('summary')
        if (result['summary_html'] != null) {
          summary.innerHTML = result["summary_html"];      

        }
      });

      chrome.runtime.onMessage.addListener((msg, sender) => {
        
        var datestring = new Date().toLocaleString().replace(",","").replace(/:.. /," ");

        chrome.extension.getBackgroundPage().console.log("Getting message");
        chrome.extension.getBackgroundPage().console.log(msg);

        var result = msg;
        // Update the extension UI
        var notes = document.getElementById('notes-list')
        var newNote = ""
        newNote += `<p><strong>${datestring}</strong></p>`
        for (let line of result['lines']) {
            newNote += `<li>${line['text']}</li>`
        }
        newNote += "<br>"

        notes.innerHTML = newNote +  notes.innerHTML
        
        // List out detected entities and fetch corresponding wiki page
        var entities = document.getElementById('entities-list')
        var newEntities = ""
        newEntities += `<p><strong>${datestring}</strong></p>`

        for (let line of result['entities']) {

            var wiki_link = `https://en.wikipedia.org/wiki/${line['entity']}`

            // var iframe = document.createElement('iframe'); 
            // iframe.style.background = "white";
            // iframe.style.height = "100%";
            // iframe.style.width = "500px";
            // iframe.style.position = "relative";
            // iframe.style.top = "0px";
            // iframe.style.right = "0px";
            // iframe.frameBorder = "none"; 
            // iframe.src = wiki_link
            // iframe.className=""


            // entities.innerHTML += `<a class="link" href="${wiki_link}" target="_blank">${line['entity']}</a> (${line['label']})`
            newEntities += `
            <li>
            <a class="link" href="${wiki_link}" target="_blank">${line['entity']}</a> (${line['label']})
            </li>
            <br>
            `
            // entities.innerHTML += '<br>'
            // entities.innerHTML += `
            //     <div class="link" id="${'box_'+wiki_link}">
            //     </div> 
            // `
            // entities.innerHTML += `<br>`

            // var boxDiv = document.getElementById('box_'+wiki_link)
            
            // boxDiv.appendChild(iframe);
        }
        newEntities += "<br><br>"

        entities.innerHTML = newEntities + entities.innerHTML 


        var summary = document.getElementById('summary')
        var newSummary = ""
        newSummary += `<p><strong>${datestring}</strong></p>`

        newSummary += result['summary']
        newSummary += `<br>`
        summary.innerHTML = newSummary + summary.innerHTML;


        // Reset button text back to normal
        button.innerHTML = "wake up studybuddy"


        // // Store the new data
        chrome.storage.local.set({"notes_html": notes.innerHTML}, function() {
          console.log('update notes');
        });
        chrome.storage.local.set({"entities_html": entities.innerHTML}, function() {
          console.log('update entities');
        });
        chrome.storage.local.set({"summary_html": summary.innerHTML}, function() {
          console.log('update summary');
        });

      });


      function hello() {
        // chrome.tabs.executeScript({
        //   file: '../inject.js'
        // }); 
        chrome.runtime.sendMessage({'myPopupIsOpen': true});
      }


      
      document.getElementById('capture-btn').addEventListener('click', hello);

        // Get session id
     
        var a = document.getElementById("notes-div");
        var b = document.getElementById("entities-div");
        var c = document.getElementById("summary-div");


      const notesButton = document.getElementById("notesbtn");
      notesButton.addEventListener(
          "click",
          () => {
            var x = document.getElementById("notes-div");
            if (x.style.display === "none") {
              a.style.display = "block";
              b.style.display = c.style.display = "none";
            } else {
              a.style.display = "block";
              b.style.display = c.style.display = "none";
            }
        }
      );

      const entitiesButton = document.getElementById("topicsbtn");
      entitiesButton.addEventListener(
          "click",
          () => {
            var x = document.getElementById("entities-div");
            if (x.style.display === "none") {
              b.style.display = "block";
              a.style.display = c.style.display = "none";
            } else {
              b.style.display = "block";
              c.style.display = a.style.display = "none";
            }
        }
      );

      const summaryButton = document.getElementById("summarybtn");
      summaryButton.addEventListener(
          "click",
          () => {
            var x = document.getElementById("summary-div");
            
            if (x.style.display === "none") {
              c.style.display = "block";
              a.style.display = b.style.display = "none";
            } else {
              c.style.display = "block";
              a.style.display = b.style.display = "none";
            }
        }
      );


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
            // fetch('http://localhost:8000/process', {
            //     method: 'POST',
            //     body: ""
            // })
            // .then(response => response.json())
            // .then(result => {
            //     chrome.extension.getBackgroundPage().console.log('Success:', result);

            //     // Update the extension UI
            //     var notes = document.getElementById('notes-list')
            //     for (let line of result['lines']) {
            //         notes.innerHTML += `<li>${line['text']}</li>`
            //     }
            //     notes.innerHTML += "<br>"
                
            //     // List out detected entities and fetch corresponding wiki page
            //     var entities = document.getElementById('entities-list')
            //     for (let line of result['entities']) {

            //         var wiki_link = `https://en.wikipedia.org/wiki/${line['entity']}`

            //         // var iframe = document.createElement('iframe'); 
            //         // iframe.style.background = "white";
            //         // iframe.style.height = "100%";
            //         // iframe.style.width = "500px";
            //         // iframe.style.position = "relative";
            //         // iframe.style.top = "0px";
            //         // iframe.style.right = "0px";
            //         // iframe.frameBorder = "none"; 
            //         // iframe.src = wiki_link
            //         // iframe.className=""


            //         // entities.innerHTML += `<a class="link" href="${wiki_link}" target="_blank">${line['entity']}</a> (${line['label']})`
            //         entities.innerHTML += `
            //         <li>
            //         <a class="link" href="${wiki_link}" target="_blank">${line['entity']}</a> (${line['label']})
            //         </li>
            //         <br>
            //         `
            //         // entities.innerHTML += '<br>'
            //         // entities.innerHTML += `
            //         //     <div class="link" id="${'box_'+wiki_link}">
            //         //     </div> 
            //         // `
            //         // entities.innerHTML += `<br>`

            //         // var boxDiv = document.getElementById('box_'+wiki_link)
                    
            //         // boxDiv.appendChild(iframe);
            //     }
            //     entities.innerHTML += "<br><br>"


            //     var summary = document.getElementById('summary')
            //     summary.innerHTML += result['summary']
            //     summary.innerHTML += `<br>`


            //     // Reset button text back to normal
            //     button.innerHTML = "wake up studybuddy"


            // })
            // .catch(error => {
            //     chrome.extension.getBackgroundPage().console.error('Error:', error);
            // });
        },
        false
      );
    },
    false
  );