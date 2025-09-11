import { useAuth } from '~hooks/use-auth'
import { useRouter } from '@tanstack/react-router'
import { BadgeCheck, Bell, CreditCard, LogOut } from 'lucide-react'
import type React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface UserButtonProps {
	children: React.ReactNode
	side?: React.ComponentProps<typeof DropdownMenuContent>['side']
}
export function UserButton({ children, side = 'bottom' }: UserButtonProps) {
	const { user, signOut } = useAuth(true)
	const router = useRouter()
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-(--radix-dropdown-menu-trigger-width) min-w-60'
				align='end'
				side={side}
			>
				<DropdownMenuLabel className='p-0'>
					<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
						<Avatar>
							<AvatarImage
								src={user.image || '/user-avatar.png'}
								alt={user.name || 'User Avatar'}
							/>
							<AvatarFallback className='rounded-lg'>TB</AvatarFallback>
						</Avatar>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span className='truncate font-semibold'>{user.name}</span>
							<span className='truncate text-muted-foreground text-xs'>
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup></DropdownMenuGroup>
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () =>
						await signOut({
							fetchOptions: {
								onSuccess: () => {
									router.navigate({ to: '/' })
								},
							},
						})
					}
				>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
