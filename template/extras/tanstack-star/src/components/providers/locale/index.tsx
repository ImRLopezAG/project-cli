import type {
	Gender,
	IntlVariations,
	LocaleContextProps,
	TranslationDictionary,
} from 'fbtee'
import { setupLocaleContext } from 'fbtee'
import type { PropsWithChildren } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	useTransition,
} from 'react'

type LocaleContextValue = {
	availableLanguages: Map<string, string>
	gender: IntlVariations
	locale: string
	localeChangeIsPending: boolean
	setGender: (gender: Gender) => void
	setLocale: (locale: string) => void
}

type LocaleProviderProps = PropsWithChildren<{
	availableLanguages: Map<string, string>
	clientLocales?: string[]
	fallbackLocale?: string
	loadLocale: LocaleContextProps['loadLocale']
	translations?: TranslationDictionary
}>

const createClientLocales = (): string[] => {
	if (typeof navigator === 'undefined') return []
	const locales = new Set<string>()
	if (navigator.language) locales.add(navigator.language)
	if (Array.isArray(navigator.languages)) {
		navigator.languages.forEach((lang) => {
			if (lang) locales.add(lang)
		})
	}
	return Array.from(locales)
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export const LocaleProvider = ({
	availableLanguages,
	children,
	clientLocales,
	fallbackLocale = 'en_US',
	loadLocale,
	translations,
}: LocaleProviderProps) => {
	const managerRef = useRef<ReturnType<typeof setupLocaleContext> | null>(null)
	if (!managerRef.current) {
		managerRef.current = setupLocaleContext({
			availableLanguages,
			clientLocales: clientLocales ?? createClientLocales(),
			fallbackLocale,
			loadLocale,
			translations: translations ?? { [fallbackLocale]: {} },
		})
	}

	const manager = managerRef.current
	const [locale, setLocaleState] = useState(manager.getLocale())
	const [gender, setGenderState] = useState(manager.gender)
	const [isPending, startTransition] = useTransition()

	const setLocale = useCallback(
		(nextLocale: string) => {
			startTransition(() => {
				void manager.setLocale(nextLocale).then((resolvedLocale) => {
					setLocaleState(resolvedLocale)
				})
			})
		},
		[manager],
	)

	const setGender = useCallback(
		(nextGender: Gender) => {
			const resolvedGender = manager.setGender(nextGender)
			setGenderState(resolvedGender)
		},
		[manager],
	)

	const value = useMemo<LocaleContextValue>(
		() => ({
			availableLanguages,
			gender,
			locale,
			localeChangeIsPending: isPending,
			setGender,
			setLocale,
		}),
		[availableLanguages, gender, isPending, locale, setGender, setLocale],
	)

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	)
}

export const useLocaleContext = () => {
	const context = useContext(LocaleContext)
	if (!context)
		throw new Error('useLocaleContext must be used within a LocaleProvider')
	return context
}

export const useLocale = useLocaleContext
