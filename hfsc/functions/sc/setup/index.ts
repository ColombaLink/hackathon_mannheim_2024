import { BasedFunction } from '@colombalink/cbased-core'
import { readFileSync } from 'fs'

const app = readFileSync('./functions/sc/setup/index.html').toString()
const fn: BasedFunction = async (based, payload, x) => {
    return app 
}


export default fn 