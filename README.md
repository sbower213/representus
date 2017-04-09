# represent.us
Boosting politcal efficacy, one zip code at a time.

## Inspiration

Currently, we feel that American citizens don't have easy access to the people who represent them in government. We made represent.us to forge a direct communication channel from representee to representative; from citizen to senator. Contacting a legislative official has never been easier, and we hope this tool will allow for more communication between elected officials and their constituents.

## What it does

Step 1: Search your zip code.
Step 2: Choose a representative or senator.
Step 3: Learn about a person who represents **you!**
Step 4: (optional) Find something you want to talk about with your legislator? Fill out our contact form to send them a note.

Note: With the current setup, it will not _ actually _ send emails to congresspeople.
The functionality is there, but one inadvertent test email to a Representative nipped that in the bud prematurely. :P

## Using represent.us
- Clone our repository, and run `npm install` in the main directory.
- To enable email sending, create an email account, put its password in a file named email.env
	- Additionally, in the `transporter` object in the `/contact` handler, edit the `user` field to be your email address.
	- Finally, change the `to:` field within the `mail` object to result.oc_email
	
## How we built it

By integrating publicly available APIs from Sunlight, Wikipedia, and Govtrack with Node.js and Express.js functionality, we have created a simple tool that makes communicating with elected officials easier than ever before. Additionally, we present constituents with information about their representatives to help them make informed decisions in upcoming elections, as well as provide feedback regarding recent congressional votes.

## Challenges we ran into

Wikipedia's API occasionally has hiccups with ambiguous search terms, so legislators with common names may not have the proper bio section displayed. Additionally, since half our team had never done web programming before, teaching new skills took a good chunk of our time.

Also, we accidentally sent a representative an email while testing with less than intelligible contents.

## Accomplishments that we're proud of

Our two first-time hackers have a new understanding of a cutting edge technology. Additionally, we were able to fully integrate everything we had in mind at the start of our project! We ended up brainstorming a few more ambitious goals (Wikipedia bios, campaign finance info, etc.) that we were able to successfully implement.

## What we learned

Creating a useful tool is easy with dedication, friends, and an eagerness to learn.

## What's next for represent.us

We're looking into also gathering information of state and local level legislators. Having easier access to all levels of government will further enable constituents to make knowledgeable decisions about the people they elect into power.