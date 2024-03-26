import Anthropic from '@anthropic-ai/sdk';
import { Message } from './globaltypes';
const anthropic = new Anthropic({apiKey: window.config.ANTROPIC_API_KEY});

const fetch = async (model: string, messages : Array<Message>) : Promise<string> =>  {
    console.log(`fetching response from ${model}`);
    const res = await anthropic.messages.create({
        model: model,
        max_tokens: 1024,
        messages: messages.map(id => {
            return {"role": id.role, "content": id.content} as Anthropic.Messages.MessageParam
        })
    });

    return res.content[0].text;
}


export default fetch;


