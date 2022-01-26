# Ionic Matrix Skeleton E2EE

# E2EE Utility Functions

If you are looking for more details around how the e2ee works in this project, you can take a look at this other repo I created with all utils functions and a big README file

[matrix-js-sdk-e2ee-helpers](https://github.com/hmendes00/matrix-js-sdk-e2ee-helpers)

## Before Using it

The ssss.ts part is still missing some components and the client is not complete.
Again, this project is about helping with the encryption part of matrix-js-sdk.

## Instructions:

in root folder run `nvm use` to make sure you have the same node version we use in the project
(If you don't use NVM, just make sure you are using Node 16)

then:
`npm install`

## How to run project

Simply run `ionic serve`

## Cross signing

To see the Cross signing part working, follow those steps:

1. open your current client where you have encryption enabled (e.g. Matrix.org).
2. Run this client and login to your account
3. You will receive a notification on your current client about a new device requesting cross signing
4. Accept the incoming request on the client
5. You will see the Emoji check opened on both sides
6. Validate the emoji check
7. You're done. You should now have the device validated and with e2ee working

## What's Missing

A lot of easy stuff: Search, Create Chat, etc.

Some less easy stuff (at least for me because I haven't done this before): Validate the mobile from a request coming from the active client (instead of requesting from this ionic client, you click on "Review Device" option on [riot.im](https://riot.im/app/#/room/!tYqDQCzEmNEQYwFEWh:matrix.org) for example)

I'll be working on those things soon.

## Finally

I just hope someone can find this helpful.
Make sure to take a look at the [matrix-js-sdk-e2ee-helpers](https://github.com/hmendes00/matrix-js-sdk-e2ee-helpers)
I added a lot of explanation about the encryption part there.

It also has some great links with explanation about how encryption works (Basic things I didn't know before)