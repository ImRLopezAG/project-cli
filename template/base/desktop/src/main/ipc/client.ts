import type { IpcRenderer } from 'electron'
import type {
	IpcProcedure,
	ProcedureInput,
	ProcedureResult,
	ProcedureTree,
} from './schema'
import { isProcedure } from './schema'

export type RendererApi<TTree extends ProcedureTree> = {
	// biome-ignore lint/suspicious/noExplicitAny: Required for flexible procedure types
	readonly [K in keyof TTree]: TTree[K] extends IpcProcedure<any, any>
		? RendererProcedure<TTree[K]>
		: TTree[K] extends ProcedureTree
			? RendererApi<TTree[K]>
			: never
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type extraction
type RendererProcedure<TProc extends IpcProcedure<any, any>> =
	ProcedureInput<TProc> extends undefined
		? () => Promise<ProcedureResult<TProc>>
		: undefined extends ProcedureInput<TProc>
			? (input?: ProcedureInput<TProc>) => Promise<ProcedureResult<TProc>>
			: (input: ProcedureInput<TProc>) => Promise<ProcedureResult<TProc>>

/**
 * Creates a plain serializable API object for contextBridge
 * No proxies - each method is a real function that can cross the bridge
 */
export const createRendererApi = <TTree extends ProcedureTree>(
	ipcRenderer: IpcRenderer,
	router: TTree,
): RendererApi<TTree> => {
	// biome-ignore lint/suspicious/noExplicitAny: Required for flexible procedure types
	const buildApi = (node: ProcedureTree | IpcProcedure<any, any>): unknown => {
		if (isProcedure(node)) {
			const procedure = node
			return async (input?: ProcedureInput<typeof procedure>) => {
				// Parse input if schema provided
				const parsedInput = procedure.input
					? procedure.input.parse(input)
					: input

				const response = await ipcRenderer.invoke(
					procedure.channel,
					parsedInput,
				)

				// Parse output if schema provided
				return procedure.output
					? (procedure.output.parse(response) as ProcedureResult<
							typeof procedure
						>)
					: (response as ProcedureResult<typeof procedure>)
			}
		}

		const tree = node as ProcedureTree
		const api: Record<string, unknown> = {}

		for (const key of Object.keys(tree)) {
			const child = tree[key]
			if (child !== undefined) {
				api[key] = buildApi(child)
			}
		}

		return api
	}

	return buildApi(router) as RendererApi<TTree>
}
