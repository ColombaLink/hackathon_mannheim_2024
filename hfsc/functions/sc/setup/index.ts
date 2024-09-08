import { BasedFunction } from '@colombalink/cbased-core'
import * as ai from '@colombalink/ai-index'



const fn: BasedFunction = async (based, payload, x) => {
    console.log("Run AI FUN", payload)
    const messages = payload?.messages || []
    const { azure, indexer, openAiChatService, searchClient } = ai
    await indexer.createInventorySearchIndex("inventory-index")

    // get the top 3 items from the inventory with the earliest expire date
    const query = "";
    const searchResults = await searchClient.search(query, {
        top: 3,
        orderBy: ["expiresAt asc"], // use it when if the expire date should be rank higher
      
    });

    let expireSoon: string[] = [];
    for await (const searchResult of searchResults.results) {
        expireSoon.push(`${JSON.stringify(searchResult.document.name)}`);

    }
    //console.log(expireSoon)

    let contextMessages = []
    let message = {
        role: 'system', 
        content: `  
        You are an assistant that helps to manage a supermarket's inventory to minimize food waste.
        As the user, inventory manager could ask you to provide food deals that combines earlist expiring
        food iteams from the inventory. Yous answer should be in a conversational and concise manner. Use simple
        and day to day using vocabulary.
        ` }
    contextMessages.push(message)


    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    message = result.choices.map(c => (c.message))
    contextMessages.push(message[0])

    message = {
        role: 'system',
        content: `Can you create a nice welcome message for the user? Start it with "Hi, I'm your AI assistant, here to help you find creative ways to minimize food waste"`
    };
    contextMessages.push(message)

    // // // // next system message.. 
    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    message = result.choices.map(c => (c.message))
    messages.push(message[0])
    contextMessages.push(message[0])

    message = {
        role: 'user',
        content: `We have ${expireSoon[0]},  ${expireSoon[1]}, and  ${expireSoon[2]} that is expiring soon. Can you give me some deals we can make from these items to attract customers?`
    };
    messages.push(message)
    contextMessages.push(message)
 
    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });



    message = result.choices.map(c => (c.message))
    messages.push(message[0])
    contextMessages.push(message[0])

    message = {
        role: 'user',
        content: 'What sort of non alcoholic beverages do you think that is suited go with these food items?'
    };
    messages.push(message)
    contextMessages.push(message)

    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    message = result.choices.map(c => (c.message))
    messages.push(message[0])
    contextMessages.push(message[0])

    console.log(messages)
    return {
        messages
    }
}


export default fn 