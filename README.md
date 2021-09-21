# StudyBuddy | Chrome extension for AI notetaking on any video feed
Winning submission for Hack the North 2021, created by John Zhang ([@john-zhang-uoft](https://github.com/john-zhang-uoft)), Justin Leung ([@leungjch](https://github.com/leungjch)), Sneha Patel ([@snehanpatel](https://github.com/snehanpatel)), and Srihari Vishnu ([@sriharivishnu](https://github.com/sriharivishnu)).

[See full Devpost submission here.](https://devpost.com/software/studdybuddy-wvsny2)

## 💡 Inspiration 💡
Due to the COVID-19 pandemic, many post secondary institutions have shifted online, meaning more online lectures and watching videos to learn. However, as university students ourselves, we often found that balancing watching lectures and taking neat, high quality notes is really, really hard. 

Writing or typing for extended periods of time is tiring, and in the process of scribbling down everything to make sure we didn't miss anything important, we end up with notes we can barely read, or are badly organized, and we don't end up focusing on watching the lecture, either.

And all of us have that one professor who talks REALLY fast and who we can't keep up with no matter how hard we try ;)

## ✨ What it does ✨

StudyBuddy is a Google Chrome extension that lets users select text directly from video feeds (Youtube, Microsoft Teams, Discord video calls, lecture videos, and more!) in real time, allowing users to easily copy text and add it to their own notes. That's right, just like you can select text from a webpage, StudyBuddy lets you select text from VIDEO. Additionally, it can compile information and automatically generate a set of notes summarizing the contents of a video.  

## ⚙️ How we built it ⚙️

![](https://i.imgur.com/7q59ZkX.png)

We used Google Chrome's extension API to build our product, and hosted a Flask backend for data-intensive tasks. Using Google Cloud's Vision API, we locate text on screen, both hand-written and typed. We then render HTML elements on top of videos so users can highlight, select, and copy text directly from video! Using the BART model, we also automatically generate summaries of videos for a quick recap, and we use Spacy NLP for named entity recognition to identify key topics, ideas, and things in the video.

## 🔥 Challenges we ran into 🔥
There were a couple quirks when it came to making chrome extensions and web development in general that took a lot of time to resolve when added up. Also, applying machine learning models from research papers was challenging because of all the new tools that we had to learn.

## 💪 Accomplishments that we're proud of 💪
We're proud of creating an application that we would use personally! We're also proud to have created our first chrome extension that works great and interacts with the user.

## 📚 What we learned 📚
We learned lots about the intricacies of full-stack development and about various ML models. We also learned a lot about GCP and SQL, particularly the CockroachDB RDBMS.

## 📈 What's next for StudyBuddy 📈
We are considering adding a feature where math equations (hand-written and typed) can be copied as LaTeX! We're also considering adding more data analytics to crowdsource data to build a Wikipedia of videos.
