import type { IpcMainInvokeEvent } from 'electron'
import type { z } from 'zod'

export type AnyZodObject = z.ZodTypeAny

/**
 * Handler function for IPC procedures
 * Can return sync value, Promise, or AsyncIterable for streaming
 */
export type IpcProcedureHandler<TInput = void, TOutput = unknown> = (
	input: TInput,
	event: IpcMainInvokeEvent,
) => Promise<TOutput> | TOutput | AsyncIterable<TOutput>

/**
 * Options for defining an IPC procedure
 */
export interface IpcProcedureOpts<TInput = void, TOutput = unknown> {
	/** Optional channel name - auto-generated if not provided */
	channel?: string
	/** Optional Zod schema for input validation */
	input?: z.ZodType<TInput>
	/** Optional Zod schema for output validation */
	output?: z.ZodType<TOutput>
	/** Handler function that executes the procedure logic */
	handler: IpcProcedureHandler<TInput, TOutput>
}

/**
 * Type helper to extract input type from IpcProcedureOpts
 */
export type ExtractInput<T> = T extends { input: z.ZodType<infer I> }
	? I
	: undefined

/**
 * Type helper to extract output type from handler
 */
export type ExtractOutput<T> = T extends {
	// biome-ignore lint/suspicious/noExplicitAny: Required for handler signature inference
	handler: (...args: any[]) => infer R
}
	? R extends Promise<infer U>
		? U
		: R extends AsyncIterable<infer U>
			? AsyncIterable<U>
			: R
	: never

export type IpcProcedure<TInput = unknown, TOutput = unknown> = {
	readonly channel: string
	readonly input?: z.ZodType<TInput>
	readonly output?: z.ZodType<TOutput>
	readonly handler: IpcProcedureHandler<TInput, TOutput>
}

/**
 * Creates an IPC procedure with proper type inference
 */
export function createIpcProcedure<
	const TInputSchema extends z.ZodType,
	TOutput,
>(opts: {
	channel?: string
	input: TInputSchema
	output?: z.ZodType<TOutput>
	handler: IpcProcedureHandler<z.output<TInputSchema>, TOutput>
}): IpcProcedure<z.output<TInputSchema>, TOutput>

export function createIpcProcedure<TOutput>(opts: {
	channel?: string
	input?: never
	output?: z.ZodType<TOutput>
	handler: IpcProcedureHandler<undefined, TOutput>
}): IpcProcedure<undefined, TOutput>

export function createIpcProcedure(opts: {
	channel?: string
	input?: z.ZodType
	output?: z.ZodType
	// biome-ignore lint/suspicious/noExplicitAny: Required for flexible handler signatures
	handler: IpcProcedureHandler<any, any>
	// biome-ignore lint/suspicious/noExplicitAny: Required for implementation signature
}): IpcProcedure<any, any> {
	return {
		channel: opts.channel as string,
		input: opts.input,
		output: opts.output,
		handler: opts.handler,
	}
}

// biome-ignore lint/suspicious/noExplicitAny: Required for runtime type checking
export const isProcedure = (value: unknown): value is IpcProcedure<any, any> =>
	typeof value === 'object' &&
	value !== null &&
	'channel' in value &&
	'handler' in value

export type ProcedureTree = {
	// biome-ignore lint/suspicious/noExplicitAny: Required for flexible procedure types
	readonly [key: string]: IpcProcedure<any, any> | ProcedureTree
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type extraction
export type ProcedureInput<TProc extends IpcProcedure<any, any>> =
	// biome-ignore lint/suspicious/noExplicitAny: Required for type pattern matching
	TProc extends IpcProcedure<infer TInput, any> ? TInput : never

// biome-ignore lint/suspicious/noExplicitAny: Required for type extraction
export type ProcedureResult<TProc extends IpcProcedure<any, any>> =
	// biome-ignore lint/suspicious/noExplicitAny: Required for type pattern matching
	TProc extends IpcProcedure<any, infer TOutput> ? TOutput : never

// Helper to build router with auto-generated channel names
export const buildRouter = <T extends ProcedureTree>(
	tree: T,
	prefix = '',
): T => {
	const result = {} as Record<string, unknown>

	for (const [key, value] of Object.entries(tree)) {
		if (isProcedure(value)) {
			// Auto-generate channel from path if not provided
			const channel = value.channel || `${prefix}${key}`
			result[key] = { ...value, channel }
		} else if (typeof value === 'object' && value !== null) {
			// Recursively build nested procedures
			result[key] = buildRouter(value as ProcedureTree, `${prefix}${key}:`)
		} else {
			result[key] = value
		}
	}

	return result as T
}
