import { createTRPCProxyClient } from '@trpc/client'
import { AppRouterType } from '@colombalink/app-backend-types'

export type api = ReturnType<typeof createTRPCProxyClient<AppRouterType>>
