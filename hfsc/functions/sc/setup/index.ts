import { BasedFunction } from '@colombalink/cbased-core'
import * as ai from '@colombalink/ai-index'



const fn: BasedFunction = async (based, payload, x) => {
    const messages = payload?.messages || []
    const { azure, indexer, openAiChatService } = ai
    await indexer.createInventorySearchIndex("inventory-index")

    ai.formatDateToYYYYMMDD

    // Initial system message
    let promptMessages = [{
        role: 'system', 
        content: `  
        You are an assistant that helps supermarket inventory manager to minimize food waste.
        As the user, the inventory manager could ask you to provide food recipes based on his 
        preferences. Your answer should be in a conversational and concise manner.
        ` 
}];

    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'system', 
            content: `  
            You are an assistant that helps supermarket inventory manager to minimize food waste.
            As the user, inventory manager could ask you to provide food receipes based on his 
            preferences. Yous answer should be in a conversationl and concise manner.
            ` },
         
        ],
        
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    let message = result.choices.map(c => (c.message))
    messages.push(message)

    messages.push({
        role: 'user',
        content: 'We have some tomatoes, cucumber, and olives left. Can you give me some healthy recipe from these items?'
    });

    // // // next system message.. 

    // result = await openAiChatService.chat.completions.create({
    //     model: 'gpt-4o',
    //     messages,
    //     max_tokens: 200,
    //     //stream: true // better for realtime and long responses
    // });

    // message = result.choices.map(c => (c.message))
    // messages.push(message)

    return {
        messages
    }
}


export default fn 