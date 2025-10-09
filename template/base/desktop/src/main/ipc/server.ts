import type { IpcMain } from 'electron'
import type { IpcProcedure, ProcedureTree } from './schema'
import { isProcedure } from './schema'

export const registerIpcHandlers = <TTree extends ProcedureTree>(
	ipcMain: IpcMain,
	router: TTree,
) => {
	for (const key of Object.keys(router) as Array<keyof TTree>) {
		const node = router[key]
		if (isProcedure(node)) {
			// biome-ignore lint/suspicious/noExplicitAny: Required for flexible procedure types
			const procedure = node as IpcProcedure<any, any>
			ipcMain.removeHandler(procedure.channel)
			ipcMain.handle(procedure.channel, async (event, payload) => {
				// Parse input if schema provided
				const validatedInput = procedure.input
					? procedure.input.parse(payload)
					: payload

				// Execute handler
				const result = procedure.handler(validatedInput, event)

				// Check if handler returns AsyncIterable (streaming)
				if (
					result &&
					typeof result === 'object' &&
					Symbol.asyncIterator in result
				) {
					// Return AsyncIterable directly for streaming
					return result
				}

				// For Promise/sync results, resolve and validate output
				const resolvedResult = await Promise.resolve(result)

				// Parse output if schema provided
				return procedure.output
					? procedure.output.parse(resolvedResult)
					: resolvedResult
			})
			continue
		}

		const childRouter = node as ProcedureTree
		registerIpcHandlers(ipcMain, childRouter)
	}
}
