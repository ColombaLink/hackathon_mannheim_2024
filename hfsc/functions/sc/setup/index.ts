import { BasedFunction } from '@colombalink/cbased-core'
import * as ai from '@colombalink/ai-index'


const fn: BasedFunction = async (based, payload, x) => {
    console.log(ai)
    return "oki"
}


export default fn 