Send SMS messages from within Roam Research!

This extension allows you to send the contents of a block to an SMS contact using the Nexmo / Vonage API. You need to have an account which you can sign up for at dashboard.nexmo.com. 

The Nexmo / Vonage API allows you a certain amount of free credit with which to test the service. After that, you will need to buy credit to be able to send messages.

Configuration in Roam Depot settings is fairly easy. Once you have an account at Nexmo / Vonage, open dashboard.nexmo.com.

Your API key and Account secret can be obtained as shown:

![image](https://user-images.githubusercontent.com/6857790/228411161-24ead83c-14e0-48c9-9521-aadc5811da47.png)

(The API Key is hidden under the red line in this image.)

Enter these two items in the Settings, and choose a name to show as the sender of the SMS.

On first load of this extension, a new page will be created in your graph: Nexmo / Vonage configuration. On that page you can define contacts to send messages to. Two dummy contacts are added on first load, in order to show you how they should be entered. Delete these and replace with a contact.

![image](https://user-images.githubusercontent.com/6857790/228412150-c20274e1-65cd-41e2-8d10-6c8114f35d5d.png)

Alternatively, you can launch the Create a New Contact in Nexmo / Vonage modal via the Command Palette or Hotkey.

Phone numbers should be a string of integers starting with the country code and then the number. Please don't prefix with + sign.

Sending a message can be done either by:
- focusing in a block and using Command Palette or Hotkey to trigger Send block as message via Nexmo / Vonage
- right-clicking on a block bullet and using the Block Context Menu, Plugins, Send block as message via Nexmo / Vonage

If you try to send a message, all of your contacts will be displayed in a dropdown selector. If you haven't added the contact yet, you can create a new contact by clicking Create New Contact in the Send a Message modal.
