import { BasedFunction } from '@colombalink/cbased-core'
import * as ai from '@colombalink/ai-index'



const fn: BasedFunction = async (based, payload, x) => {
    const messages = payload?.messages || []
    const { azure, indexer, openAiChatService } = ai
    await indexer.createInventorySearchIndex("inventory-index")

    ai.formatDateToYYYYMMDD

    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'system', content: `
            
You are an assistant that provide mapping between a food and a list of items of a supermarket
inventory.query contains a food item. sources include top similar inventory items found for that food item using a search index.
Priority of your answer as below,
1. use the smallest expireAt value in the sources to prioritize finding the inventory item.
Answer the query using only the facts listed in sources provides below.
Answer should containt the most suited food item from the inventory in following json format,
            ` },
         
        ],
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    const message = result.choices.map(c => (c.message))
    messages.push(message)

    message.push({
        content: 'user mesage',
        role: 'user',
    })

    // next system message.. 

    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    return {
        messages
    }
}


export default fn 