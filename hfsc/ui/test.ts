import { createTRPCProxyClient } from '@trpc/client'
import { AppRouterType, createBasedTrpcLink } from '@colombalink/app-backend-types'
import { BasedClient } from '@based/client'

const based  = new BasedClient({
    host: 'ws://localhost:8000'
}) 

const client = createTRPCProxyClient<AppRouterType>({ 
    // @ts-ignore
    links: createBasedTrpcLink(based, "trpc-default"), transformer: [] 
})
// setRequestContext(client, { scope: { userId: "us00000000", orgAliasId: "", projectAliasId: "" }})


